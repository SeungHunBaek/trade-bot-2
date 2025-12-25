import { OHLCV, IndicatorResult } from './types';

/**
 * Simple Moving Average (SMA)
 * 단순 이동평균
 */
export function calculateSMA(
  candles: OHLCV[],
  period: number,
): IndicatorResult[] {
  if (candles.length < period) {
    return [];
  }

  const results: IndicatorResult[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += candles[i - j].close;
    }
    results.push({
      timestamp: candles[i].timestamp,
      value: sum / period,
    });
  }

  return results;
}

/**
 * Exponential Moving Average (EMA)
 * 지수 이동평균
 */
export function calculateEMA(
  candles: OHLCV[],
  period: number,
): IndicatorResult[] {
  if (candles.length < period) {
    return [];
  }

  const results: IndicatorResult[] = [];
  const multiplier = 2 / (period + 1);

  // 첫 번째 EMA는 SMA로 계산
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let ema = sum / period;

  results.push({
    timestamp: candles[period - 1].timestamp,
    value: ema,
  });

  // 이후 EMA 계산
  for (let i = period; i < candles.length; i++) {
    ema = (candles[i].close - ema) * multiplier + ema;
    results.push({
      timestamp: candles[i].timestamp,
      value: ema,
    });
  }

  return results;
}

/**
 * 두 이동평균 간의 크로스오버 감지
 * 1: 골든 크로스 (단기가 장기를 상향 돌파)
 * -1: 데드 크로스 (단기가 장기를 하향 돌파)
 * 0: 크로스 없음
 */
export function detectMACrossover(
  shortMA: IndicatorResult[],
  longMA: IndicatorResult[],
): { timestamp: number; signal: 1 | -1 | 0 }[] {
  const results: { timestamp: number; signal: 1 | -1 | 0 }[] = [];

  // 타임스탬프로 정렬된 매핑 생성
  const shortMAMap = new Map(shortMA.map((r) => [r.timestamp, r.value]));
  const longMAMap = new Map(longMA.map((r) => [r.timestamp, r.value]));

  // 공통 타임스탬프 찾기
  const commonTimestamps = shortMA
    .filter((r) => longMAMap.has(r.timestamp))
    .map((r) => r.timestamp)
    .sort((a, b) => a - b);

  for (let i = 1; i < commonTimestamps.length; i++) {
    const prevTs = commonTimestamps[i - 1];
    const currTs = commonTimestamps[i];

    const prevShort = shortMAMap.get(prevTs)!;
    const prevLong = longMAMap.get(prevTs)!;
    const currShort = shortMAMap.get(currTs)!;
    const currLong = longMAMap.get(currTs)!;

    // 골든 크로스: 단기 MA가 장기 MA를 상향 돌파
    if (prevShort <= prevLong && currShort > currLong) {
      results.push({ timestamp: currTs, signal: 1 });
    }
    // 데드 크로스: 단기 MA가 장기 MA를 하향 돌파
    else if (prevShort >= prevLong && currShort < currLong) {
      results.push({ timestamp: currTs, signal: -1 });
    } else {
      results.push({ timestamp: currTs, signal: 0 });
    }
  }

  return results;
}
