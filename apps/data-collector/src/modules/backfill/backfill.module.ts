import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { CandleModule } from '../candle/candle.module';

import { BackfillService } from './backfill.service';
import { BackfillProcessor } from './backfill.processor';
import { BackfillController } from './backfill.controller';

export const BACKFILL_QUEUE = 'backfill';

@Module({
  imports: [
    BullModule.registerQueue({
      name: BACKFILL_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 1000,
      },
    }),
    CandleModule,
  ],
  controllers: [BackfillController],
  providers: [BackfillService, BackfillProcessor],
  exports: [BackfillService],
})
export class BackfillModule {}
