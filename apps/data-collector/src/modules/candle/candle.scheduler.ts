import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { DEFAULT_TIMEFRAMES, Timeframe } from '@passive-money/common';

import { CandleService } from './candle.service';

@Injectable()
export class CandleScheduler implements OnModuleInit {
  private readonly logger = new Logger(CandleScheduler.name);
  private isCollecting = false;

  // 수집할 심볼 목록 (초기에는 주요 심볼만)
  private readonly symbols = ['BTC/KRW', 'ETH/KRW', 'XRP/KRW'];

  constructor(private readonly candleService: CandleService) {}

  async onModuleInit() {
    this.logger.log('캔들 스케줄러 초기화 완료');
    // 서비스 시작 시 최근 캔들 수집
    await this.collectRecentCandles();
  }

  // 매 분 10초에 실행 (1분 캔들 수집)
  @Cron('10 * * * * *')
  async collect1mCandles() {
    if (this.isCollecting) {
      this.logger.warn('이전 수집 작업이 진행 중입니다');
      return;
    }

    this.isCollecting = true;

    try {
      for (const symbol of this.symbols) {
        await this.candleService.fetchAndSaveCandles(symbol, '1m', undefined, 5);
      }
    } catch (error) {
      this.logger.error(`1분 캔들 수집 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.isCollecting = false;
    }
  }

  // 매 5분 15초에 실행 (5분 캔들 수집)
  @Cron('15 */5 * * * *')
  async collect5mCandles() {
    try {
      for (const symbol of this.symbols) {
        await this.candleService.fetchAndSaveCandles(symbol, '5m', undefined, 5);
      }
    } catch (error) {
      this.logger.error(`5분 캔들 수집 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 최근 캔들 수집 (서비스 시작 시)
  private async collectRecentCandles() {
    this.logger.log('최근 캔들 수집 시작');

    for (const symbol of this.symbols) {
      for (const timeframe of DEFAULT_TIMEFRAMES) {
        try {
          await this.candleService.fetchAndSaveCandles(
            symbol,
            timeframe as Timeframe,
            undefined,
            100,
          );
        } catch (error) {
          this.logger.error(
            `${symbol} ${timeframe} 초기 수집 실패: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }
    }

    this.logger.log('최근 캔들 수집 완료');
  }

  getSymbols(): string[] {
    return this.symbols;
  }

  addSymbol(symbol: string): void {
    if (!this.symbols.includes(symbol)) {
      this.symbols.push(symbol);
      this.logger.log(`심볼 추가됨: ${symbol}`);
    }
  }

  removeSymbol(symbol: string): void {
    const index = this.symbols.indexOf(symbol);
    if (index > -1) {
      this.symbols.splice(index, 1);
      this.logger.log(`심볼 제거됨: ${symbol}`);
    }
  }
}
