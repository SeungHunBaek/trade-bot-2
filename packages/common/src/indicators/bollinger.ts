import { OHLCV, BollingerResult } from './types';

/**
 * Bollinger Bands
 * 볼린저 밴드
 *
 * Middle Band = SMA(period)
 * Upper Band = Middle Band + (stdDev * multiplier)
 * Lower Band = Middle Band - (stdDev * multiplier)
 */
export function calculateBollingerBands(
  candles: OHLCV[],
  period: number = 20,
  multiplier: number = 2,
): BollingerResult[] {
  if (candles.length < period) {
    return [];
  }

  const results: BollingerResult[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    // SMA 계산
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += candles[i - j].close;
    }
    const middle = sum / period;

    // 표준편차 계산
    let squaredDiffSum = 0;
    for (let j = 0; j < period; j++) {
      squaredDiffSum += Math.pow(candles[i - j].close - middle, 2);
    }
    const stdDev = Math.sqrt(squaredDiffSum / period);

    results.push({
      timestamp: candles[i].timestamp,
      upper: middle + stdDev * multiplier,
      middle,
      lower: middle - stdDev * multiplier,
    });
  }

  return results;
}

/**
 * 볼린저 밴드 %B 계산
 * %B = (Price - Lower Band) / (Upper Band - Lower Band)
 *
 * %B > 1: 상단 밴드 위
 * %B < 0: 하단 밴드 아래
 * %B = 0.5: 중간 밴드 근처
 */
export function calculatePercentB(
  candles: OHLCV[],
  bollingerResults: BollingerResult[],
): { timestamp: number; value: number }[] {
  const results: { timestamp: number; value: number }[] = [];

  // 볼린저 결과와 캔들을 타임스탬프로 매칭
  const bollingerMap = new Map(
    bollingerResults.map((r) => [r.timestamp, r]),
  );

  for (const candle of candles) {
    const bollinger = bollingerMap.get(candle.timestamp);
    if (bollinger) {
      const bandwidth = bollinger.upper - bollinger.lower;
      const percentB =
        bandwidth === 0 ? 0.5 : (candle.close - bollinger.lower) / bandwidth;

      results.push({
        timestamp: candle.timestamp,
        value: percentB,
      });
    }
  }

  return results;
}

/**
 * 볼린저 밴드 시그널 생성
 * 1: 가격이 하단 밴드 아래에서 올라옴 → 매수
 * -1: 가격이 상단 밴드 위에서 내려옴 → 매도
 * 0: 시그널 없음
 */
export function generateBollingerSignal(
  candles: OHLCV[],
  bollingerResults: BollingerResult[],
): { timestamp: number; signal: 1 | -1 | 0 }[] {
  const signals: { timestamp: number; signal: 1 | -1 | 0 }[] = [];

  const bollingerMap = new Map(
    bollingerResults.map((r) => [r.timestamp, r]),
  );

  // 시간순으로 정렬
  const sortedCandles = [...candles].sort((a, b) => a.timestamp - b.timestamp);

  for (let i = 1; i < sortedCandles.length; i++) {
    const prevCandle = sortedCandles[i - 1];
    const currCandle = sortedCandles[i];

    const prevBollinger = bollingerMap.get(prevCandle.timestamp);
    const currBollinger = bollingerMap.get(currCandle.timestamp);

    if (!prevBollinger || !currBollinger) {
      continue;
    }

    // 하단 밴드 돌파 후 복귀 → 매수
    if (
      prevCandle.close <= prevBollinger.lower &&
      currCandle.close > currBollinger.lower
    ) {
      signals.push({ timestamp: currCandle.timestamp, signal: 1 });
    }
    // 상단 밴드 돌파 후 복귀 → 매도
    else if (
      prevCandle.close >= prevBollinger.upper &&
      currCandle.close < currBollinger.upper
    ) {
      signals.push({ timestamp: currCandle.timestamp, signal: -1 });
    } else {
      signals.push({ timestamp: currCandle.timestamp, signal: 0 });
    }
  }

  return signals;
}
