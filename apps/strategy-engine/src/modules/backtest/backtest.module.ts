import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CandleEntity } from '@passive-money/database';

import { BacktestController } from './backtest.controller';
import { BacktestService } from './backtest.service';

@Module({
  imports: [TypeOrmModule.forFeature([CandleEntity])],
  controllers: [BacktestController],
  providers: [BacktestService],
  exports: [BacktestService],
})
export class BacktestModule {}
