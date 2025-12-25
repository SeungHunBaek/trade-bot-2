import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

import { CandleEntity } from '@passive-money/database';
import {
  OHLCV,
  calculateRSI,
  generateRSISignal,
  calculateMACD,
  generateMACDSignal,
  calculateSMA,
  calculateEMA,
  detectMACrossover,
} from '@passive-money/common';

export interface BacktestConfig {
  exchange: string;
  symbol: string;
  timeframe: string;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  strategyType: 'rsi' | 'macd' | 'ma_crossover';
  params: Record<string, unknown>;
  feeRate?: number;
  slippage?: number;
}

export interface Trade {
  entryTime: number;
  exitTime: number;
  entryPrice: number;
  exitPrice: number;
  side: 'long' | 'short';
  size: number;
  pnl: number;
  pnlPercent: number;
  fee: number;
}

export interface BacktestResult {
  config: BacktestConfig;
  trades: Trade[];
  metrics: {
    totalReturn: number;
    totalReturnPercent: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
    maxDrawdown: number;
    maxDrawdownPercent: number;
    sharpeRatio: number;
    startCapital: number;
    endCapital: number;
  };
  equityCurve: { timestamp: number; equity: number }[];
}

@Injectable()
export class BacktestService {
  private readonly logger = new Logger(BacktestService.name);

  constructor(
    @InjectRepository(CandleEntity)
    private readonly candleRepository: Repository<CandleEntity>,
  ) {}

  async runBacktest(config: BacktestConfig): Promise<BacktestResult> {
    this.logger.log(`Starting backtest: ${config.strategyType} on ${config.symbol}`);

    // 캔들 데이터 조회
    const candles = await this.getCandles(config);
    if (candles.length < 100) {
      throw new Error('Not enough candle data for backtest');
    }

    const ohlcv = this.convertToOHLCV(candles);

    // 전략에 따른 시그널 생성
    const signals = this.generateBacktestSignals(ohlcv, config);

    // 백테스트 실행
    const trades = this.executeTrades(ohlcv, signals, config);

    // 성과 지표 계산
    const metrics = this.calculateMetrics(trades, config.initialCapital);
    const equityCurve = this.calculateEquityCurve(
      trades,
      ohlcv,
      config.initialCapital,
    );

    return {
      config,
      trades,
      metrics,
      equityCurve,
    };
  }

  private async getCandles(config: BacktestConfig): Promise<CandleEntity[]> {
    const startTimestamp = config.startDate.getTime();
    const endTimestamp = config.endDate.getTime();

    return this.candleRepository.find({
      where: {
        exchange: config.exchange,
        symbol: config.symbol,
        timeframe: config.timeframe,
        timestamp: Between(startTimestamp, endTimestamp),
      },
      order: { timestamp: 'ASC' },
    });
  }

  private convertToOHLCV(candles: CandleEntity[]): OHLCV[] {
    return candles.map((c) => ({
      timestamp: Number(c.timestamp),
      open: Number(c.open),
      high: Number(c.high),
      low: Number(c.low),
      close: Number(c.close),
      volume: Number(c.volume),
    }));
  }

  private generateBacktestSignals(
    candles: OHLCV[],
    config: BacktestConfig,
  ): { timestamp: number; signal: 1 | -1 | 0 }[] {
    switch (config.strategyType) {
      case 'rsi': {
        const period = (config.params['rsiPeriod'] as number) || 14;
        const overbought = (config.params['overbought'] as number) || 70;
        const oversold = (config.params['oversold'] as number) || 30;
        const rsiResults = calculateRSI(candles, period);
        return generateRSISignal(rsiResults, overbought, oversold);
      }

      case 'macd': {
        const fast = (config.params['fastPeriod'] as number) || 12;
        const slow = (config.params['slowPeriod'] as number) || 26;
        const signal = (config.params['signalPeriod'] as number) || 9;
        const macdResults = calculateMACD(candles, fast, slow, signal);
        return generateMACDSignal(macdResults);
      }

      case 'ma_crossover': {
        const shortPeriod = (config.params['shortPeriod'] as number) || 9;
        const longPeriod = (config.params['longPeriod'] as number) || 21;
        const useEMA = (config.params['useEMA'] as boolean) || false;
        const shortMA = useEMA
          ? calculateEMA(candles, shortPeriod)
          : calculateSMA(candles, shortPeriod);
        const longMA = useEMA
          ? calculateEMA(candles, longPeriod)
          : calculateSMA(candles, longPeriod);
        return detectMACrossover(shortMA, longMA);
      }

      default:
        return [];
    }
  }

  private executeTrades(
    candles: OHLCV[],
    signals: { timestamp: number; signal: 1 | -1 | 0 }[],
    config: BacktestConfig,
  ): Trade[] {
    const trades: Trade[] = [];
    const feeRate = config.feeRate || 0.001; // 0.1% 기본 수수료
    const slippage = config.slippage || 0.0005; // 0.05% 기본 슬리피지

    let position: {
      entryTime: number;
      entryPrice: number;
      size: number;
      side: 'long';
    } | null = null;

    const priceMap = new Map(candles.map((c) => [c.timestamp, c]));

    for (const { timestamp, signal } of signals) {
      const candle = priceMap.get(timestamp);
      if (!candle) continue;

      // 매수 시그널 - 포지션 진입
      if (signal === 1 && !position) {
        const entryPrice = candle.close * (1 + slippage);
        const size = config.initialCapital / entryPrice;

        position = {
          entryTime: timestamp,
          entryPrice,
          size,
          side: 'long',
        };
      }
      // 매도 시그널 - 포지션 청산
      else if (signal === -1 && position) {
        const exitPrice = candle.close * (1 - slippage);
        const grossPnl = (exitPrice - position.entryPrice) * position.size;
        const fee =
          position.entryPrice * position.size * feeRate +
          exitPrice * position.size * feeRate;
        const netPnl = grossPnl - fee;
        const pnlPercent =
          (netPnl / (position.entryPrice * position.size)) * 100;

        trades.push({
          entryTime: position.entryTime,
          exitTime: timestamp,
          entryPrice: position.entryPrice,
          exitPrice,
          side: 'long',
          size: position.size,
          pnl: netPnl,
          pnlPercent,
          fee,
        });

        position = null;
      }
    }

    // 마지막 포지션 강제 청산
    if (position && candles.length > 0) {
      const lastCandle = candles[candles.length - 1];
      const exitPrice = lastCandle.close * (1 - slippage);
      const grossPnl = (exitPrice - position.entryPrice) * position.size;
      const fee =
        position.entryPrice * position.size * feeRate +
        exitPrice * position.size * feeRate;
      const netPnl = grossPnl - fee;
      const pnlPercent = (netPnl / (position.entryPrice * position.size)) * 100;

      trades.push({
        entryTime: position.entryTime,
        exitTime: lastCandle.timestamp,
        entryPrice: position.entryPrice,
        exitPrice,
        side: 'long',
        size: position.size,
        pnl: netPnl,
        pnlPercent,
        fee,
      });
    }

    return trades;
  }

  private calculateMetrics(
    trades: Trade[],
    initialCapital: number,
  ): BacktestResult['metrics'] {
    if (trades.length === 0) {
      return {
        totalReturn: 0,
        totalReturnPercent: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        maxDrawdownPercent: 0,
        sharpeRatio: 0,
        startCapital: initialCapital,
        endCapital: initialCapital,
      };
    }

    const totalReturn = trades.reduce((sum, t) => sum + t.pnl, 0);
    const totalReturnPercent = (totalReturn / initialCapital) * 100;
    const endCapital = initialCapital + totalReturn;

    const winningTrades = trades.filter((t) => t.pnl > 0);
    const losingTrades = trades.filter((t) => t.pnl < 0);

    const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));

    const avgWin = winningTrades.length > 0
      ? grossProfit / winningTrades.length
      : 0;
    const avgLoss = losingTrades.length > 0
      ? grossLoss / losingTrades.length
      : 0;

    // Max Drawdown 계산
    let peak = initialCapital;
    let maxDrawdown = 0;
    let equity = initialCapital;

    for (const trade of trades) {
      equity += trade.pnl;
      if (equity > peak) {
        peak = equity;
      }
      const drawdown = peak - equity;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    const maxDrawdownPercent = peak > 0 ? (maxDrawdown / peak) * 100 : 0;

    // Sharpe Ratio 계산 (단순화된 버전)
    const returns = trades.map((t) => t.pnlPercent);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
        returns.length,
    );
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

    return {
      totalReturn,
      totalReturnPercent,
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: (winningTrades.length / trades.length) * 100,
      avgWin,
      avgLoss,
      profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
      maxDrawdown,
      maxDrawdownPercent,
      sharpeRatio,
      startCapital: initialCapital,
      endCapital,
    };
  }

  private calculateEquityCurve(
    trades: Trade[],
    candles: OHLCV[],
    initialCapital: number,
  ): { timestamp: number; equity: number }[] {
    const curve: { timestamp: number; equity: number }[] = [];
    let equity = initialCapital;

    // 시작점
    if (candles.length > 0) {
      curve.push({ timestamp: candles[0].timestamp, equity });
    }

    // 각 거래 후 자본
    for (const trade of trades) {
      equity += trade.pnl;
      curve.push({ timestamp: trade.exitTime, equity });
    }

    return curve;
  }
}
