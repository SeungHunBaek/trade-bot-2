export enum ExchangeId {
  BITHUMB = 'bithumb',
  BYBIT = 'bybit',
  OKX = 'okx',
}

export enum MarketType {
  SPOT = 'spot',
  FUTURES = 'futures',
}

export interface ExchangeCredentials {
  accessKey: string;
  secretKey: string;
  passphrase?: string; // OKX용
}

export interface Ticker {
  symbol: string;
  last: number;
  bid: number;
  ask: number;
  high: number;
  low: number;
  volume: number;
  timestamp: number;
}

export interface OrderBook {
  symbol: string;
  bids: [number, number][]; // [price, amount][]
  asks: [number, number][]; // [price, amount][]
  timestamp: number;
}

export interface Balance {
  currency: string;
  total: number;
  available: number;
  locked: number;
}

export interface Candle {
  exchange: ExchangeId;
  symbol: string;
  timeframe: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
