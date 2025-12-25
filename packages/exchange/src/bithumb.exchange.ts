import * as ccxt from 'ccxt';

import {
  ExchangeId,
  ExchangeCredentials,
  Ticker,
  OrderBook,
  Balance,
  Candle,
  OrderRequest,
  OrderResponse,
  OrderStatus,
  OrderSide,
  OrderType,
  Timeframe,
} from '@passive-money/common';

import { BaseExchange } from './base.exchange';

export class BithumbExchange extends BaseExchange {
  private client: ccxt.bithumb;

  constructor(credentials?: ExchangeCredentials) {
    super(ExchangeId.BITHUMB, credentials);

    this.client = new ccxt.bithumb({
      apiKey: credentials?.accessKey,
      secret: credentials?.secretKey,
      enableRateLimit: true,
    });
  }

  getName(): string {
    return 'Bithumb';
  }

  isAuthenticated(): boolean {
    return !!(this.credentials?.accessKey && this.credentials?.secretKey);
  }

  async fetchTicker(symbol: string): Promise<Ticker> {
    const ticker = await this.client.fetchTicker(symbol);

    return {
      symbol,
      last: ticker.last ?? 0,
      bid: ticker.bid ?? 0,
      ask: ticker.ask ?? 0,
      high: ticker.high ?? 0,
      low: ticker.low ?? 0,
      volume: ticker.baseVolume ?? 0,
      timestamp: ticker.timestamp ?? Date.now(),
    };
  }

  async fetchOrderBook(symbol: string, limit = 20): Promise<OrderBook> {
    const orderbook = await this.client.fetchOrderBook(symbol, limit);

    return {
      symbol,
      bids: orderbook.bids.map(([price, amount]) => [
        Number(price ?? 0),
        Number(amount ?? 0),
      ]) as [number, number][],
      asks: orderbook.asks.map(([price, amount]) => [
        Number(price ?? 0),
        Number(amount ?? 0),
      ]) as [number, number][],
      timestamp: orderbook.timestamp ?? Date.now(),
    };
  }

  async fetchCandles(
    symbol: string,
    timeframe: Timeframe,
    since?: number,
    limit = 500,
  ): Promise<Candle[]> {
    const ccxtTimeframe = this.toCcxtTimeframe(timeframe);
    const ohlcv = await this.client.fetchOHLCV(
      symbol,
      ccxtTimeframe,
      since,
      limit,
    );

    return ohlcv.map(([timestamp, open, high, low, close, volume]) => ({
      exchange: ExchangeId.BITHUMB,
      symbol,
      timeframe,
      timestamp: timestamp as number,
      open: open as number,
      high: high as number,
      low: low as number,
      close: close as number,
      volume: volume as number,
    }));
  }

  async fetchBalance(): Promise<Balance[]> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    const balance = await this.client.fetchBalance();
    const balances: Balance[] = [];

    const totalObj = balance.total as unknown as Record<string, number>;
    const freeObj = balance.free as unknown as Record<string, number>;
    const usedObj = balance.used as unknown as Record<string, number>;

    for (const [currency, total] of Object.entries(totalObj)) {
      if (total > 0) {
        const free = freeObj[currency] ?? 0;
        const used = usedObj[currency] ?? 0;

        balances.push({
          currency,
          total,
          available: free,
          locked: used,
        });
      }
    }

    return balances;
  }

  async createOrder(request: OrderRequest): Promise<OrderResponse> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    const order = await this.client.createOrder(
      request.symbol,
      request.type,
      request.side,
      request.amount,
      request.price,
    );

    return this.mapOrderResponse(order);
  }

  async cancelOrder(orderId: string, symbol: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      await this.client.cancelOrder(orderId, symbol);
      return true;
    } catch {
      return false;
    }
  }

  async fetchOrder(orderId: string, symbol: string): Promise<OrderResponse> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    const order = await this.client.fetchOrder(orderId, symbol);
    return this.mapOrderResponse(order);
  }

  async fetchOpenOrders(symbol?: string): Promise<OrderResponse[]> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    const orders = await this.client.fetchOpenOrders(symbol);
    return orders.map((order) => this.mapOrderResponse(order));
  }

  async getSymbols(): Promise<string[]> {
    const markets = await this.client.loadMarkets();
    return Object.keys(markets).filter((symbol) => symbol.endsWith('/KRW'));
  }

  async validateCredentials(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      await this.client.fetchBalance();
      return true;
    } catch {
      return false;
    }
  }

  private mapOrderResponse(order: ccxt.Order): OrderResponse {
    return {
      orderId: order.id,
      symbol: order.symbol,
      side: order.side === 'buy' ? OrderSide.BUY : OrderSide.SELL,
      type: order.type === 'limit' ? OrderType.LIMIT : OrderType.MARKET,
      price: order.price ?? 0,
      amount: order.amount ?? 0,
      filled: order.filled ?? 0,
      remaining: order.remaining ?? 0,
      status: this.mapOrderStatus(order.status),
      timestamp: order.timestamp ?? Date.now(),
    };
  }

  private mapOrderStatus(status: string | undefined): OrderStatus {
    switch (status) {
      case 'open':
        return OrderStatus.OPEN;
      case 'closed':
        return OrderStatus.FILLED;
      case 'canceled':
        return OrderStatus.CANCELED;
      case 'expired':
        return OrderStatus.EXPIRED;
      case 'rejected':
        return OrderStatus.REJECTED;
      default:
        return OrderStatus.NEW;
    }
  }

  private toCcxtTimeframe(timeframe: Timeframe): string {
    const mapping: Record<string, string> = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d',
      '1w': '1w',
    };

    return mapping[timeframe] ?? '1m';
  }
}
