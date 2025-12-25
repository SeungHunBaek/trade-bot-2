import { OHLCV, MACDResult } from './types';

/**
 * Moving Average Convergence Divergence (MACD)
 * 이동평균 수렴확산
 *
 * MACD Line = EMA(12) - EMA(26)
 * Signal Line = EMA(9) of MACD Line
 * Histogram = MACD Line - Signal Line
 */
export function calculateMACD(
  candles: OHLCV[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9,
): MACDResult[] {
  if (candles.length < slowPeriod + signalPeriod) {
    return [];
  }

  const results: MACDResult[] = [];

  // EMA 계산 헬퍼
  const calculateEMAValues = (
    data: number[],
    period: number,
  ): Map<number, number> => {
    const emaMap = new Map<number, number>();
    const multiplier = 2 / (period + 1);

    // 첫 번째 EMA는 SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[i];
    }
    let ema = sum / period;
    emaMap.set(period - 1, ema);

    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
      emaMap.set(i, ema);
    }

    return emaMap;
  };

  const closes = candles.map((c) => c.close);

  // Fast EMA (12일)
  const fastEMA = calculateEMAValues(closes, fastPeriod);

  // Slow EMA (26일)
  const slowEMA = calculateEMAValues(closes, slowPeriod);

  // MACD Line 계산
  const macdLine: { index: number; value: number }[] = [];
  for (let i = slowPeriod - 1; i < candles.length; i++) {
    if (fastEMA.has(i) && slowEMA.has(i)) {
      macdLine.push({
        index: i,
        value: fastEMA.get(i)! - slowEMA.get(i)!,
      });
    }
  }

  if (macdLine.length < signalPeriod) {
    return [];
  }

  // Signal Line (MACD의 9일 EMA)
  const macdValues = macdLine.map((m) => m.value);
  const signalMultiplier = 2 / (signalPeriod + 1);

  let signalSum = 0;
  for (let i = 0; i < signalPeriod; i++) {
    signalSum += macdValues[i];
  }
  let signalEMA = signalSum / signalPeriod;

  // 첫 번째 결과
  const firstIndex = macdLine[signalPeriod - 1].index;
  results.push({
    timestamp: candles[firstIndex].timestamp,
    macd: macdLine[signalPeriod - 1].value,
    signal: signalEMA,
    histogram: macdLine[signalPeriod - 1].value - signalEMA,
  });

  // 이후 결과
  for (let i = signalPeriod; i < macdLine.length; i++) {
    signalEMA = (macdValues[i] - signalEMA) * signalMultiplier + signalEMA;

    results.push({
      timestamp: candles[macdLine[i].index].timestamp,
      macd: macdLine[i].value,
      signal: signalEMA,
      histogram: macdLine[i].value - signalEMA,
    });
  }

  return results;
}

/**
 * MACD 크로스오버 시그널 생성
 * 1: MACD가 Signal을 상향 돌파 → 매수
 * -1: MACD가 Signal을 하향 돌파 → 매도
 * 0: 시그널 없음
 */
export function generateMACDSignal(
  macdResults: MACDResult[],
): { timestamp: number; signal: 1 | -1 | 0 }[] {
  const signals: { timestamp: number; signal: 1 | -1 | 0 }[] = [];

  for (let i = 1; i < macdResults.length; i++) {
    const prevHistogram = macdResults[i - 1].histogram;
    const currHistogram = macdResults[i].histogram;

    // 히스토그램이 음수에서 양수로 전환 → 매수
    if (prevHistogram <= 0 && currHistogram > 0) {
      signals.push({ timestamp: macdResults[i].timestamp, signal: 1 });
    }
    // 히스토그램이 양수에서 음수로 전환 → 매도
    else if (prevHistogram >= 0 && currHistogram < 0) {
      signals.push({ timestamp: macdResults[i].timestamp, signal: -1 });
    } else {
      signals.push({ timestamp: macdResults[i].timestamp, signal: 0 });
    }
  }

  return signals;
}
