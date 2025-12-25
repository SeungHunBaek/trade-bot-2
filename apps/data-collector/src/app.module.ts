import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';

import { getDatabaseConfig, getRedisConfig } from '@passive-money/config';
import {
  CandleEntity,
  ExchangeEntity,
  SystemLogEntity,
} from '@passive-money/database';

import { AppController } from './app.controller';
import { HealthModule } from './modules/health/health.module';
import { CandleModule } from './modules/candle/candle.module';
import { BackfillModule } from './modules/backfill/backfill.module';

const dbConfig = getDatabaseConfig();
const redisConfig = getRedisConfig();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      username: dbConfig.username,
      password: dbConfig.password,
      entities: [CandleEntity, ExchangeEntity, SystemLogEntity],
      synchronize: dbConfig.synchronize,
      logging: dbConfig.logging,
    }),
    BullModule.forRoot({
      connection: {
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
      },
    }),
    ScheduleModule.forRoot(),
    HealthModule,
    CandleModule,
    BackfillModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
