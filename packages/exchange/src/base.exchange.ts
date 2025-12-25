import {
  ExchangeId,
  ExchangeCredentials,
  Ticker,
  OrderBook,
  Balance,
  Candle,
  OrderRequest,
  OrderResponse,
  Timeframe,
} from '@passive-money/common';

export abstract class BaseExchange {
  protected exchangeId: ExchangeId;
  protected credentials?: ExchangeCredentials;

  constructor(exchangeId: ExchangeId, credentials?: ExchangeCredentials) {
    this.exchangeId = exchangeId;
    this.credentials = credentials;
  }

  abstract getName(): string;

  abstract isAuthenticated(): boolean;

  // Market Data
  abstract fetchTicker(symbol: string): Promise<Ticker>;
  abstract fetchOrderBook(symbol: string, limit?: number): Promise<OrderBook>;
  abstract fetchCandles(
    symbol: string,
    timeframe: Timeframe,
    since?: number,
    limit?: number,
  ): Promise<Candle[]>;

  // Account
  abstract fetchBalance(): Promise<Balance[]>;

  // Trading
  abstract createOrder(request: OrderRequest): Promise<OrderResponse>;
  abstract cancelOrder(orderId: string, symbol: string): Promise<boolean>;
  abstract fetchOrder(orderId: string, symbol: string): Promise<OrderResponse>;
  abstract fetchOpenOrders(symbol?: string): Promise<OrderResponse[]>;

  // Utility
  abstract getSymbols(): Promise<string[]>;
  abstract validateCredentials(): Promise<boolean>;

  getExchangeId(): ExchangeId {
    return this.exchangeId;
  }
}
