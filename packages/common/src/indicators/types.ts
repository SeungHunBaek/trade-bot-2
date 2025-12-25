export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorResult {
  timestamp: number;
  value: number;
}

export interface MACDResult {
  timestamp: number;
  macd: number;
  signal: number;
  histogram: number;
}

export interface BollingerResult {
  timestamp: number;
  upper: number;
  middle: number;
  lower: number;
}
