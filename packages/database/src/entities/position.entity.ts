import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';

import { OrderSide, TradingMode } from '@passive-money/common';

import { AccountEntity } from './account.entity';
import { StrategyInstanceEntity } from './strategy-instance.entity';

@Entity('positions')
@Unique(['accountId', 'symbol', 'strategyInstanceId'])
@Index(['accountId', 'symbol'])
export class PositionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  accountId: string;

  @ManyToOne(() => AccountEntity)
  @JoinColumn({ name: 'accountId' })
  account: AccountEntity;

  @Column({ type: 'uuid', nullable: true })
  strategyInstanceId: string;

  @ManyToOne(() => StrategyInstanceEntity)
  @JoinColumn({ name: 'strategyInstanceId' })
  strategyInstance: StrategyInstanceEntity;

  @Column({ type: 'varchar', length: 20 })
  exchange: string;

  @Column({ type: 'varchar', length: 20 })
  symbol: string;

  @Column({ type: 'enum', enum: OrderSide })
  side: OrderSide;

  @Column({ type: 'enum', enum: TradingMode })
  mode: TradingMode;

  @Column({ type: 'numeric', precision: 20, scale: 8 })
  amount: number;

  @Column({ type: 'numeric', precision: 20, scale: 8 })
  entryPrice: number;

  @Column({ type: 'numeric', precision: 20, scale: 8, default: 0 })
  realizedPnl: number;

  @Column({ type: 'boolean', default: true })
  isOpen: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  openedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  closedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
