export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

export enum OrderType {
  LIMIT = 'limit',
  MARKET = 'market',
}

export enum OrderStatus {
  NEW = 'new',
  OPEN = 'open',
  PARTIAL = 'partial',
  FILLED = 'filled',
  CANCELED = 'canceled',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum TradingMode {
  BACKTEST = 'backtest',
  PAPER = 'paper',
  LIVE = 'live',
}

export enum StrategyStatus {
  DRAFT = 'draft',
  BACKTEST_PASS = 'backtest_pass',
  APPROVED_FOR_PAPER = 'approved_for_paper',
  PAPER = 'paper',
  APPROVED_FOR_LIVE = 'approved_for_live',
  LIVE = 'live',
  STOPPED = 'stopped',
}

export interface OrderRequest {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price?: number;
  amount: number;
}

export interface OrderResponse {
  orderId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  amount: number;
  filled: number;
  remaining: number;
  status: OrderStatus;
  timestamp: number;
}

export interface Position {
  symbol: string;
  side: OrderSide;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
}

export interface TradeSignal {
  symbol: string;
  side: OrderSide;
  price?: number;
  amount: number;
  reason: string;
  confidence: number; // 0-1
  timestamp: number;
}

export interface RiskSettings {
  maxRiskPerTrade: number; // 0.01 = 1%
  dailyLossLimit: number; // 0.03 = 3%
  maxPositionSize: number; // 0.20 = 20%
  slippageTolerance: number; // 0.005 = 0.5%
}
