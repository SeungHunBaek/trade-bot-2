import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { StrategyEntity } from './strategy.entity';
import { AccountEntity } from './account.entity';
import { OrderEntity } from './order.entity';

export enum StrategyInstanceStatus {
  DRAFT = 'draft',
  BACKTEST_PASS = 'backtest_pass',
  APPROVED_FOR_PAPER = 'approved_for_paper',
  PAPER = 'paper',
  APPROVED_FOR_LIVE = 'approved_for_live',
  LIVE = 'live',
  STOPPED = 'stopped',
}

@Entity('strategy_instances')
export class StrategyInstanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  strategyId: string;

  @ManyToOne(() => StrategyEntity, (strategy) => strategy.instances)
  @JoinColumn({ name: 'strategyId' })
  strategy: StrategyEntity;

  @Column({ type: 'uuid' })
  accountId: string;

  @ManyToOne(() => AccountEntity)
  @JoinColumn({ name: 'accountId' })
  account: AccountEntity;

  @Column({ type: 'varchar', length: 20, nullable: true })
  versionId: string;

  @Column({
    type: 'enum',
    enum: StrategyInstanceStatus,
    default: StrategyInstanceStatus.DRAFT,
  })
  status: StrategyInstanceStatus;

  @Column({ type: 'varchar', array: true })
  symbols: string[]; // ['BTC_KRW', 'ETH_KRW']

  @Column({ type: 'jsonb' })
  params: Record<string, unknown>;

  @Column({ type: 'boolean', default: false })
  isRunning: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  stoppedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => OrderEntity, (order) => order.strategyInstance)
  orders: OrderEntity[];
}
