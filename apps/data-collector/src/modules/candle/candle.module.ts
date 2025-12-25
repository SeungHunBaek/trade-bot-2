import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CandleEntity } from '@passive-money/database';

import { CandleService } from './candle.service';
import { CandleScheduler } from './candle.scheduler';
import { CandleController } from './candle.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CandleEntity])],
  controllers: [CandleController],
  providers: [CandleService, CandleScheduler],
  exports: [CandleService],
})
export class CandleModule {}
