import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import { CandleEntity } from '@passive-money/database';

import { SignalService } from './signal.service';
import { SignalProcessor } from './signal.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([CandleEntity]),
    BullModule.registerQueue({
      name: 'signal-queue',
    }),
  ],
  providers: [SignalService, SignalProcessor],
  exports: [SignalService],
})
export class SignalModule {}
