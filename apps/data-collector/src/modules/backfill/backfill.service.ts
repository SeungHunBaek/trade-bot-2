import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { BACKFILL_QUEUE } from './backfill.module';
import { BackfillJobData, BackfillRequest, BackfillStatus } from './backfill.types';

@Injectable()
export class BackfillService {
  private readonly logger = new Logger(BackfillService.name);

  constructor(
    @InjectQueue(BACKFILL_QUEUE)
    private readonly backfillQueue: Queue<BackfillJobData>,
  ) {}

  async startBackfill(request: BackfillRequest): Promise<{ jobIds: string[] }> {
    const {
      symbol,
      timeframe,
      startYear,
      startMonth,
      endYear = new Date().getFullYear(),
      endMonth = new Date().getMonth() + 1,
    } = request;

    const jobIds: string[] = [];

    // 시작 날짜부터 종료 날짜까지 월 단위로 작업 생성
    let currentYear = startYear;
    let currentMonth = startMonth;

    while (
      currentYear < endYear ||
      (currentYear === endYear && currentMonth <= endMonth)
    ) {
      const jobData: BackfillJobData = {
        symbol,
        timeframe,
        year: currentYear,
        month: currentMonth,
      };

      const job = await this.backfillQueue.add(
        `backfill-${symbol}-${timeframe}-${currentYear}-${currentMonth}`,
        jobData,
        {
          jobId: `${symbol}-${timeframe}-${currentYear}-${String(currentMonth).padStart(2, '0')}`,
        },
      );

      jobIds.push(job.id as string);

      this.logger.log(
        `백필 작업 추가: ${symbol} ${timeframe} ${currentYear}-${String(currentMonth).padStart(2, '0')}`,
      );

      // 다음 달로 이동
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    return { jobIds };
  }

  async getJobStatus(jobId: string): Promise<BackfillStatus | null> {
    const job = await this.backfillQueue.getJob(jobId);

    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress as number;

    return {
      jobId: job.id as string,
      symbol: job.data.symbol,
      timeframe: job.data.timeframe,
      year: job.data.year,
      month: job.data.month,
      status: state as BackfillStatus['status'],
      progress,
      error: job.failedReason,
    };
  }

  async getAllJobs(): Promise<BackfillStatus[]> {
    const jobs = await this.backfillQueue.getJobs([
      'waiting',
      'active',
      'completed',
      'failed',
    ]);

    return Promise.all(
      jobs.map(async (job) => {
        const state = await job.getState();
        return {
          jobId: job.id as string,
          symbol: job.data.symbol,
          timeframe: job.data.timeframe,
          year: job.data.year,
          month: job.data.month,
          status: state as BackfillStatus['status'],
          progress: job.progress as number,
          error: job.failedReason,
        };
      }),
    );
  }

  async getQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.backfillQueue.getWaitingCount(),
      this.backfillQueue.getActiveCount(),
      this.backfillQueue.getCompletedCount(),
      this.backfillQueue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = await this.backfillQueue.getJob(jobId);

    if (!job) {
      return false;
    }

    await job.remove();
    this.logger.log(`백필 작업 취소됨: ${jobId}`);
    return true;
  }

  async clearAllJobs(): Promise<void> {
    await this.backfillQueue.obliterate({ force: true });
    this.logger.log('모든 백필 작업이 삭제되었습니다');
  }

  async retryFailedJobs(): Promise<number> {
    const failedJobs = await this.backfillQueue.getJobs(['failed']);
    let retriedCount = 0;

    for (const job of failedJobs) {
      await job.retry();
      retriedCount++;
    }

    this.logger.log(`${retriedCount}개의 실패한 작업을 재시도합니다`);
    return retriedCount;
  }
}
