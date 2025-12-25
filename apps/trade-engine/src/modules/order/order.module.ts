import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import {
  OrderEntity,
  OrderFillEntity,
  AccountEntity,
  ApiCredentialEntity,
} from '@passive-money/database';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderProcessor } from './order.processor';
import { RiskModule } from '../risk/risk.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderFillEntity,
      AccountEntity,
      ApiCredentialEntity,
    ]),
    BullModule.registerQueue({
      name: 'order-queue',
    }),
    RiskModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderProcessor],
  exports: [OrderService],
})
export class OrderModule {}
