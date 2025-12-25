import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import { getDatabaseConfig } from '@passive-money/config';
import {
  OrderEntity,
  OrderFillEntity,
  PositionEntity,
  AccountEntity,
  ApiCredentialEntity,
  StrategyInstanceEntity,
  RiskSettingEntity,
  BalanceHistoryEntity,
  ExchangeEntity,
  StrategyEntity,
  StrategyVersionEntity,
  CandleEntity,
  SystemLogEntity,
  NotificationEntity,
} from '@passive-money/database';

import { AppController } from './app.controller';
import { OrderModule } from './modules/order/order.module';
import { PositionModule } from './modules/position/position.module';
import { RiskModule } from './modules/risk/risk.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...getDatabaseConfig(),
      entities: [
        OrderEntity,
        OrderFillEntity,
        PositionEntity,
        AccountEntity,
        ApiCredentialEntity,
        StrategyInstanceEntity,
        RiskSettingEntity,
        BalanceHistoryEntity,
        ExchangeEntity,
        StrategyEntity,
        StrategyVersionEntity,
        CandleEntity,
        SystemLogEntity,
        NotificationEntity,
      ],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    OrderModule,
    PositionModule,
    RiskModule,
    HealthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
