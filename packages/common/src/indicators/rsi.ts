import { OHLCV, IndicatorResult } from './types';

/**
 * Relative Strength Index (RSI)
 * 상대강도지수
 *
 * RSI = 100 - (100 / (1 + RS))
 * RS = Average Gain / Average Loss
 */
export function calculateRSI(
  candles: OHLCV[],
  period: number = 14,
): IndicatorResult[] {
  if (candles.length < period + 1) {
    return [];
  }

  const results: IndicatorResult[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // 가격 변화 계산
  for (let i = 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // 첫 번째 평균 (SMA)
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // 첫 번째 RSI
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - 100 / (1 + rs);

  results.push({
    timestamp: candles[period].timestamp,
    value: rsi,
  });

  // 이후 RSI (Wilder's Smoothing Method)
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - 100 / (1 + rs);

    results.push({
      timestamp: candles[i + 1].timestamp,
      value: rsi,
    });
  }

  return results;
}

/**
 * RSI 기반 시그널 생성
 * 1: 과매도 → 매수 시그널 (RSI가 oversold를 상향 돌파)
 * -1: 과매수 → 매도 시그널 (RSI가 overbought를 하향 돌파)
 * 0: 시그널 없음
 */
export function generateRSISignal(
  rsiResults: IndicatorResult[],
  overbought: number = 70,
  oversold: number = 30,
): { timestamp: number; signal: 1 | -1 | 0 }[] {
  const signals: { timestamp: number; signal: 1 | -1 | 0 }[] = [];

  for (let i = 1; i < rsiResults.length; i++) {
    const prevRSI = rsiResults[i - 1].value;
    const currRSI = rsiResults[i].value;

    // 과매도에서 벗어남 → 매수 시그널
    if (prevRSI <= oversold && currRSI > oversold) {
      signals.push({ timestamp: rsiResults[i].timestamp, signal: 1 });
    }
    // 과매수에서 벗어남 → 매도 시그널
    else if (prevRSI >= overbought && currRSI < overbought) {
      signals.push({ timestamp: rsiResults[i].timestamp, signal: -1 });
    } else {
      signals.push({ timestamp: rsiResults[i].timestamp, signal: 0 });
    }
  }

  return signals;
}
