import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import { getDatabaseConfig } from '@passive-money/config';
import {
  StrategyEntity,
  StrategyVersionEntity,
  StrategyInstanceEntity,
  AccountEntity,
  OrderEntity,
  PositionEntity,
  CandleEntity,
  ExchangeEntity,
  ApiCredentialEntity,
  RiskSettingEntity,
} from '@passive-money/database';

import { AppController } from './app.controller';
import { StrategyModule } from './modules/strategy/strategy.module';
import { SignalModule } from './modules/signal/signal.module';
import { BacktestModule } from './modules/backtest/backtest.module';
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
        StrategyEntity,
        StrategyVersionEntity,
        StrategyInstanceEntity,
        AccountEntity,
        OrderEntity,
        PositionEntity,
        CandleEntity,
        ExchangeEntity,
        ApiCredentialEntity,
        RiskSettingEntity,
      ],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    StrategyModule,
    SignalModule,
    BacktestModule,
    HealthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
