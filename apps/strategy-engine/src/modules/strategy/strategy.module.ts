import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  StrategyEntity,
  StrategyVersionEntity,
  StrategyInstanceEntity,
} from '@passive-money/database';

import { StrategyController } from './strategy.controller';
import { StrategyService } from './strategy.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StrategyEntity,
      StrategyVersionEntity,
      StrategyInstanceEntity,
    ]),
  ],
  controllers: [StrategyController],
  providers: [StrategyService],
  exports: [StrategyService],
})
export class StrategyModule {}
