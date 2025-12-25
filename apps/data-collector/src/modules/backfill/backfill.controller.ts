import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';

import { Timeframe } from '@passive-money/common';

import { BackfillService } from './backfill.service';
import { BackfillRequest } from './backfill.types';

@Controller('backfill')
export class BackfillController {
  constructor(private readonly backfillService: BackfillService) {}

  @Post('start')
  async startBackfill(@Body() request: BackfillRequest) {
    // symbol에서 _ 를 / 로 변환
    const formattedRequest = {
      ...request,
      symbol: request.symbol.replace('_', '/'),
    };

    const result = await this.backfillService.startBackfill(formattedRequest);
    return {
      message: '백필 작업이 시작되었습니다',
      ...result,
    };
  }

  @Post('start/full')
  async startFullBackfill(
    @Body() body: { symbol: string; timeframe: Timeframe },
  ) {
    // 2020년 1월부터 현재까지 전체 백필
    const formattedSymbol = body.symbol.replace('_', '/');

    const result = await this.backfillService.startBackfill({
      symbol: formattedSymbol,
      timeframe: body.timeframe,
      startYear: 2020,
      startMonth: 1,
    });

    return {
      message: '전체 백필 작업이 시작되었습니다 (2020-01 ~ 현재)',
      ...result,
    };
  }

  @Get('status')
  async getQueueStats() {
    return this.backfillService.getQueueStats();
  }

  @Get('jobs')
  async getAllJobs() {
    const jobs = await this.backfillService.getAllJobs();
    return { jobs };
  }

  @Get('jobs/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    const status = await this.backfillService.getJobStatus(jobId);

    if (!status) {
      return { error: '작업을 찾을 수 없습니다' };
    }

    return status;
  }

  @Delete('jobs/:jobId')
  async cancelJob(@Param('jobId') jobId: string) {
    const cancelled = await this.backfillService.cancelJob(jobId);

    if (!cancelled) {
      return { error: '작업을 찾을 수 없습니다' };
    }

    return { message: '작업이 취소되었습니다', jobId };
  }

  @Delete('jobs')
  async clearAllJobs() {
    await this.backfillService.clearAllJobs();
    return { message: '모든 작업이 삭제되었습니다' };
  }

  @Post('retry-failed')
  async retryFailedJobs() {
    const count = await this.backfillService.retryFailedJobs();
    return { message: `${count}개의 실패한 작업을 재시도합니다`, count };
  }
}
