import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { CandleEntity, StrategyInstanceEntity } from '@passive-money/database';
import {
  OHLCV,
  calculateRSI,
  generateRSISignal,
  calculateMACD,
  generateMACDSignal,
  calculateSMA,
  calculateEMA,
  detectMACrossover,
  calculateBollingerBands,
  generateBollingerSignal,
} from '@passive-money/common';

export interface Signal {
  instanceId: string;
  symbol: string;
  type: 'buy' | 'sell';
  strength: number; // 0-100
  price: number;
  timestamp: number;
  reason: string;
  indicators: Record<string, number>;
}

export type StrategyType = 'rsi' | 'macd' | 'ma_crossover' | 'bollinger';

@Injectable()
export class SignalService {
  private readonly logger = new Logger(SignalService.name);

  constructor(
    @InjectRepository(CandleEntity)
    private readonly candleRepository: Repository<CandleEntity>,
    @InjectQueue('signal-queue')
    private readonly signalQueue: Queue,
  ) {}

  /**
   * 전략 인스턴스에 대해 시그널 생성
   */
  async generateSignals(instance: StrategyInstanceEntity): Promise<Signal[]> {
    const signals: Signal[] = [];
    const strategyType = instance.params['type'] as StrategyType;

    for (const symbol of instance.symbols) {
      const candles = await this.getCandles(
        instance.params['exchange'] as string || 'bithumb',
        symbol,
        instance.params['timeframe'] as string || '1h',
        200,
      );

      if (candles.length < 50) {
        this.logger.warn(`Not enough candles for ${symbol}`);
        continue;
      }

      const ohlcv = this.convertToOHLCV(candles);
      let signal: Signal | null = null;

      switch (strategyType) {
        case 'rsi':
          signal = this.generateRSIStrategySignal(instance, symbol, ohlcv);
          break;
        case 'macd':
          signal = this.generateMACDStrategySignal(instance, symbol, ohlcv);
          break;
        case 'ma_crossover':
          signal = this.generateMACrossoverSignal(instance, symbol, ohlcv);
          break;
        case 'bollinger':
          signal = this.generateBollingerStrategySignal(instance, symbol, ohlcv);
          break;
        default:
          this.logger.warn(`Unknown strategy type: ${strategyType}`);
      }

      if (signal) {
        signals.push(signal);
      }
    }

    return signals;
  }

  /**
   * RSI 전략 시그널 생성
   */
  private generateRSIStrategySignal(
    instance: StrategyInstanceEntity,
    symbol: string,
    candles: OHLCV[],
  ): Signal | null {
    const period = (instance.params['rsiPeriod'] as number) || 14;
    const overbought = (instance.params['overbought'] as number) || 70;
    const oversold = (instance.params['oversold'] as number) || 30;

    const rsiResults = calculateRSI(candles, period);
    if (rsiResults.length < 2) return null;

    const rsiSignals = generateRSISignal(rsiResults, overbought, oversold);
    const lastSignal = rsiSignals[rsiSignals.length - 1];
    const lastRSI = rsiResults[rsiResults.length - 1];
    const lastCandle = candles[candles.length - 1];

    if (lastSignal.signal === 0) return null;

    return {
      instanceId: instance.id,
      symbol,
      type: lastSignal.signal === 1 ? 'buy' : 'sell',
      strength: Math.abs(50 - lastRSI.value) * 2,
      price: lastCandle.close,
      timestamp: lastCandle.timestamp,
      reason:
        lastSignal.signal === 1
          ? `RSI ${lastRSI.value.toFixed(1)} crossed above ${oversold} (oversold)`
          : `RSI ${lastRSI.value.toFixed(1)} crossed below ${overbought} (overbought)`,
      indicators: { rsi: lastRSI.value },
    };
  }

  /**
   * MACD 전략 시그널 생성
   */
  private generateMACDStrategySignal(
    instance: StrategyInstanceEntity,
    symbol: string,
    candles: OHLCV[],
  ): Signal | null {
    const fastPeriod = (instance.params['fastPeriod'] as number) || 12;
    const slowPeriod = (instance.params['slowPeriod'] as number) || 26;
    const signalPeriod = (instance.params['signalPeriod'] as number) || 9;

    const macdResults = calculateMACD(candles, fastPeriod, slowPeriod, signalPeriod);
    if (macdResults.length < 2) return null;

    const macdSignals = generateMACDSignal(macdResults);
    const lastSignal = macdSignals[macdSignals.length - 1];
    const lastMACD = macdResults[macdResults.length - 1];
    const lastCandle = candles[candles.length - 1];

    if (lastSignal.signal === 0) return null;

    return {
      instanceId: instance.id,
      symbol,
      type: lastSignal.signal === 1 ? 'buy' : 'sell',
      strength: Math.min(100, Math.abs(lastMACD.histogram) * 10),
      price: lastCandle.close,
      timestamp: lastCandle.timestamp,
      reason:
        lastSignal.signal === 1
          ? `MACD crossed above signal line (histogram: ${lastMACD.histogram.toFixed(2)})`
          : `MACD crossed below signal line (histogram: ${lastMACD.histogram.toFixed(2)})`,
      indicators: {
        macd: lastMACD.macd,
        signal: lastMACD.signal,
        histogram: lastMACD.histogram,
      },
    };
  }

  /**
   * 이동평균 크로스오버 전략 시그널 생성
   */
  private generateMACrossoverSignal(
    instance: StrategyInstanceEntity,
    symbol: string,
    candles: OHLCV[],
  ): Signal | null {
    const shortPeriod = (instance.params['shortPeriod'] as number) || 9;
    const longPeriod = (instance.params['longPeriod'] as number) || 21;
    const useEMA = (instance.params['useEMA'] as boolean) || false;

    const shortMA = useEMA
      ? calculateEMA(candles, shortPeriod)
      : calculateSMA(candles, shortPeriod);
    const longMA = useEMA
      ? calculateEMA(candles, longPeriod)
      : calculateSMA(candles, longPeriod);

    if (shortMA.length < 2 || longMA.length < 2) return null;

    const crossoverSignals = detectMACrossover(shortMA, longMA);
    const lastSignal = crossoverSignals[crossoverSignals.length - 1];

    if (!lastSignal || lastSignal.signal === 0) return null;

    const lastShortMA = shortMA[shortMA.length - 1];
    const lastLongMA = longMA[longMA.length - 1];
    const lastCandle = candles[candles.length - 1];

    return {
      instanceId: instance.id,
      symbol,
      type: lastSignal.signal === 1 ? 'buy' : 'sell',
      strength: Math.min(100, Math.abs(lastShortMA.value - lastLongMA.value) / lastLongMA.value * 1000),
      price: lastCandle.close,
      timestamp: lastCandle.timestamp,
      reason:
        lastSignal.signal === 1
          ? `Golden Cross: ${shortPeriod}MA crossed above ${longPeriod}MA`
          : `Dead Cross: ${shortPeriod}MA crossed below ${longPeriod}MA`,
      indicators: {
        shortMA: lastShortMA.value,
        longMA: lastLongMA.value,
      },
    };
  }

  /**
   * 볼린저 밴드 전략 시그널 생성
   */
  private generateBollingerStrategySignal(
    instance: StrategyInstanceEntity,
    symbol: string,
    candles: OHLCV[],
  ): Signal | null {
    const period = (instance.params['period'] as number) || 20;
    const multiplier = (instance.params['multiplier'] as number) || 2;

    const bollingerResults = calculateBollingerBands(candles, period, multiplier);
    if (bollingerResults.length < 2) return null;

    const bollingerSignals = generateBollingerSignal(candles, bollingerResults);
    const lastSignal = bollingerSignals[bollingerSignals.length - 1];

    if (!lastSignal || lastSignal.signal === 0) return null;

    const lastBollinger = bollingerResults[bollingerResults.length - 1];
    const lastCandle = candles[candles.length - 1];

    return {
      instanceId: instance.id,
      symbol,
      type: lastSignal.signal === 1 ? 'buy' : 'sell',
      strength: Math.min(100, Math.abs(lastCandle.close - lastBollinger.middle) / (lastBollinger.upper - lastBollinger.lower) * 100),
      price: lastCandle.close,
      timestamp: lastCandle.timestamp,
      reason:
        lastSignal.signal === 1
          ? `Price bounced from lower Bollinger Band`
          : `Price rejected at upper Bollinger Band`,
      indicators: {
        upper: lastBollinger.upper,
        middle: lastBollinger.middle,
        lower: lastBollinger.lower,
      },
    };
  }

  /**
   * 시그널을 주문 큐에 추가
   */
  async queueSignal(signal: Signal): Promise<void> {
    await this.signalQueue.add('process-signal', signal, {
      removeOnComplete: true,
      removeOnFail: false,
    });
    this.logger.log(`Queued signal: ${signal.type} ${signal.symbol}`);
  }

  /**
   * 캔들 데이터 조회
   */
  private async getCandles(
    exchange: string,
    symbol: string,
    timeframe: string,
    limit: number,
  ): Promise<CandleEntity[]> {
    return this.candleRepository.find({
      where: {
        exchange,
        symbol,
        timeframe,
      },
      order: { timestamp: 'ASC' },
      take: limit,
    });
  }

  /**
   * CandleEntity를 OHLCV로 변환
   */
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
}
