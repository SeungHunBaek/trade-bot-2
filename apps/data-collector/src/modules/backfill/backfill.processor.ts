import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { TIMEFRAMES, Timeframe } from '@passive-money/common';

import { CandleService } from '../candle/candle.service';

import { BACKFILL_QUEUE } from './backfill.module';
import { BackfillJobData } from './backfill.types';

@Processor(BACKFILL_QUEUE)
export class BackfillProcessor extends WorkerHost {
  private readonly logger = new Logger(BackfillProcessor.name);

  constructor(private readonly candleService: CandleService) {
    super();
  }

  async process(job: Job<BackfillJobData>): Promise<{ savedCount: number }> {
    const { symbol, timeframe, year, month } = job.data;

    this.logger.log(
      `백필 시작: ${symbol} ${timeframe} ${year}-${String(month).padStart(2, '0')}`,
    );

    const startTime = new Date(year, month - 1, 1).getTime();
    const endTime = new Date(year, month, 0, 23, 59, 59, 999).getTime();

    const timeframeMs = TIMEFRAMES[timeframe as keyof typeof TIMEFRAMES];
    const totalCandles = Math.ceil((endTime - startTime) / timeframeMs);

    let savedCount = 0;
    let currentTime = startTime;
    let iteration = 0;

    // 거래소 API 제한을 고려하여 배치로 수집
    const batchSize = 200;

    while (currentTime < endTime) {
      try {
        const count = await this.candleService.fetchAndSaveCandles(
          symbol,
          timeframe as Timeframe,
          currentTime,
          batchSize,
        );

        savedCount += count;
        currentTime += timeframeMs * batchSize;
        iteration++;

        // 진행률 업데이트
        const progress = Math.min(
          100,
          Math.floor((iteration * batchSize * 100) / totalCandles),
        );
        await job.updateProgress(progress);

        // API 제한 방지를 위한 딜레이
        await this.delay(500);
      } catch (error) {
        this.logger.error(
          `백필 중 오류 발생: ${symbol} ${timeframe} ${year}-${month}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        throw error;
      }
    }

    this.logger.log(
      `백필 완료: ${symbol} ${timeframe} ${year}-${String(month).padStart(2, '0')} - ${savedCount}개 저장됨`,
    );

    return { savedCount };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<BackfillJobData>) {
    const { symbol, timeframe, year, month } = job.data;
    this.logger.log(
      `백필 작업 완료: ${symbol} ${timeframe} ${year}-${String(month).padStart(2, '0')}`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<BackfillJobData>, error: Error) {
    const { symbol, timeframe, year, month } = job.data;
    this.logger.error(
      `백필 작업 실패: ${symbol} ${timeframe} ${year}-${String(month).padStart(2, '0')} - ${error.message}`,
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
