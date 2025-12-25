import { ExchangeId } from '../types/exchange.types';

export const EXCHANGE_INFO = {
  [ExchangeId.BITHUMB]: {
    name: 'Bithumb',
    country: 'KR',
    baseUrl: 'https://api.bithumb.com',
    wsUrl: 'wss://pubwss.bithumb.com/pub/ws',
    feeRate: 0.0025, // 0.25%
  },
  [ExchangeId.BYBIT]: {
    name: 'Bybit',
    country: 'SG',
    baseUrl: 'https://api.bybit.com',
    wsUrl: 'wss://stream.bybit.com',
    feeRate: 0.001, // 0.1%
  },
  [ExchangeId.OKX]: {
    name: 'OKX',
    country: 'SC',
    baseUrl: 'https://www.okx.com',
    wsUrl: 'wss://ws.okx.com:8443',
    feeRate: 0.001, // 0.1%
  },
} as const;

export const SUPPORTED_EXCHANGES = Object.keys(EXCHANGE_INFO) as ExchangeId[];
