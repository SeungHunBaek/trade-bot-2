import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  RiskSettingEntity,
  PositionEntity,
  OrderEntity,
} from '@passive-money/database';

import { RiskService } from './risk.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RiskSettingEntity, PositionEntity, OrderEntity]),
  ],
  providers: [RiskService],
  exports: [RiskService],
})
export class RiskModule {}
