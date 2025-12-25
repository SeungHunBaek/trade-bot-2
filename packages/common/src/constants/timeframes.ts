export const TIMEFRAMES = {
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
} as const;

export type Timeframe = keyof typeof TIMEFRAMES;

export const SUPPORTED_TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

export const DEFAULT_TIMEFRAMES: Timeframe[] = ['1m', '5m'];

export function getTimeframeMs(timeframe: Timeframe): number {
  return TIMEFRAMES[timeframe];
}

export function getTimeframeSeconds(timeframe: Timeframe): number {
  return TIMEFRAMES[timeframe] / 1000;
}
