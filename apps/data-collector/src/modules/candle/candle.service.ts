import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CandleEntity } from '@passive-money/database';
import { BithumbExchange } from '@passive-money/exchange';
import { ExchangeId, Candle, Timeframe } from '@passive-money/common';

@Injectable()
export class CandleService {
  private readonly logger = new Logger(CandleService.name);
  private readonly exchange: BithumbExchange;

  constructor(
    @InjectRepository(CandleEntity)
    private readonly candleRepository: Repository<CandleEntity>,
  ) {
    this.exchange = new BithumbExchange();
  }

  async fetchAndSaveCandles(
    symbol: string,
    timeframe: Timeframe,
    since?: number,
    limit = 200,
  ): Promise<number> {
    try {
      const candles = await this.exchange.fetchCandles(
        symbol,
        timeframe,
        since,
        limit,
      );

      if (candles.length === 0) {
        return 0;
      }

      const savedCount = await this.saveCandles(candles);
      this.logger.log(
        `${symbol} ${timeframe} 캔들 ${savedCount}개 저장 완료`,
      );

      return savedCount;
    } catch (error) {
      this.logger.error(
        `${symbol} ${timeframe} 캔들 수집 실패: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async saveCandles(candles: Candle[]): Promise<number> {
    if (candles.length === 0) return 0;

    const entities = candles.map((candle) => ({
      exchange: candle.exchange,
      symbol: candle.symbol,
      timeframe: candle.timeframe,
      timestamp: candle.timestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
    }));

    // Upsert: 중복 시 업데이트
    const result = await this.candleRepository
      .createQueryBuilder()
      .insert()
      .into(CandleEntity)
      .values(entities)
      .orUpdate(
        ['open', 'high', 'low', 'close', 'volume'],
        ['exchange', 'symbol', 'timeframe', 'timestamp'],
      )
      .execute();

    return result.identifiers.length;
  }

  async getLatestCandle(
    exchange: ExchangeId,
    symbol: string,
    timeframe: string,
  ): Promise<CandleEntity | null> {
    return this.candleRepository.findOne({
      where: { exchange, symbol, timeframe },
      order: { timestamp: 'DESC' },
    });
  }

  async getCandleCount(
    exchange: ExchangeId,
    symbol: string,
    timeframe: string,
  ): Promise<number> {
    return this.candleRepository.count({
      where: { exchange, symbol, timeframe },
    });
  }

  async getAvailableSymbols(): Promise<string[]> {
    return this.exchange.getSymbols();
  }

  async getCandles(
    exchange: ExchangeId,
    symbol: string,
    timeframe: string,
    from?: number,
    to?: number,
    limit = 1000,
  ): Promise<CandleEntity[]> {
    const query = this.candleRepository
      .createQueryBuilder('candle')
      .where('candle.exchange = :exchange', { exchange })
      .andWhere('candle.symbol = :symbol', { symbol })
      .andWhere('candle.timeframe = :timeframe', { timeframe });

    if (from) {
      query.andWhere('candle.timestamp >= :from', { from });
    }

    if (to) {
      query.andWhere('candle.timestamp <= :to', { to });
    }

    return query
      .orderBy('candle.timestamp', 'ASC')
      .limit(limit)
      .getMany();
  }
}
