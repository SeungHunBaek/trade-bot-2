import { DataSource } from 'typeorm';

import { getDatabaseConfig } from '@passive-money/config';

import { CandleEntity } from './entities/candle.entity';
import { ExchangeEntity } from './entities/exchange.entity';
import { AccountEntity } from './entities/account.entity';
import { ApiCredentialEntity } from './entities/api-credential.entity';
import { StrategyEntity } from './entities/strategy.entity';
import { StrategyVersionEntity } from './entities/strategy-version.entity';
import { StrategyInstanceEntity } from './entities/strategy-instance.entity';
import { OrderEntity } from './entities/order.entity';
import { OrderFillEntity } from './entities/order-fill.entity';
import { PositionEntity } from './entities/position.entity';
import { BalanceHistoryEntity } from './entities/balance-history.entity';
import { RiskSettingEntity } from './entities/risk-setting.entity';
import { SystemLogEntity } from './entities/system-log.entity';
import { NotificationEntity } from './entities/notification.entity';

const config = getDatabaseConfig();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.host,
  port: config.port,
  database: config.database,
  username: config.username,
  password: config.password,
  synchronize: config.synchronize,
  logging: config.logging,
  entities: [
    CandleEntity,
    ExchangeEntity,
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
    SystemLogEntity,
    NotificationEntity,
  ],
  migrations: ['dist/migrations/*.js'],
});
