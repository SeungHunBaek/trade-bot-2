import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { getDatabaseConfig } from '@passive-money/config';
import {
  UserEntity,
  UserApiKeyEntity,
  AccountEntity,
  ApiCredentialEntity,
  StrategyEntity,
  StrategyVersionEntity,
  StrategyInstanceEntity,
  OrderEntity,
  OrderFillEntity,
  PositionEntity,
  BalanceHistoryEntity,
  RiskSettingEntity,
  ExchangeEntity,
  CandleEntity,
  SystemLogEntity,
  NotificationEntity,
} from '@passive-money/database';

import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
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
        UserEntity,
        UserApiKeyEntity,
        AccountEntity,
        ApiCredentialEntity,
        StrategyEntity,
        StrategyVersionEntity,
        StrategyInstanceEntity,
        OrderEntity,
        OrderFillEntity,
        PositionEntity,
        BalanceHistoryEntity,
        RiskSettingEntity,
        ExchangeEntity,
        CandleEntity,
        SystemLogEntity,
        NotificationEntity,
      ],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    HealthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
