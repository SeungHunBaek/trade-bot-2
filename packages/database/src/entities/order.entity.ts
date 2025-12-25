import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

import { OrderSide, OrderType, OrderStatus, TradingMode } from '@passive-money/common';

import { AccountEntity } from './account.entity';
import { StrategyInstanceEntity } from './strategy-instance.entity';
import { OrderFillEntity } from './order-fill.entity';

@Entity('orders')
@Index(['accountId', 'symbol', 'status'])
@Index(['strategyInstanceId'])
@Index(['createdAt'])
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  externalOrderId: string; // 거래소 주문 ID

  @Column({ type: 'uuid' })
  accountId: string;

  @ManyToOne(() => AccountEntity)
  @JoinColumn({ name: 'accountId' })
  account: AccountEntity;

  @Column({ type: 'uuid', nullable: true })
  strategyInstanceId: string;

  @ManyToOne(() => StrategyInstanceEntity, (instance) => instance.orders)
  @JoinColumn({ name: 'strategyInstanceId' })
  strategyInstance: StrategyInstanceEntity;

  @Column({ type: 'varchar', length: 20 })
  exchange: string;

  @Column({ type: 'varchar', length: 20 })
  symbol: string;

  @Column({ type: 'enum', enum: OrderSide })
  side: OrderSide;

  @Column({ type: 'enum', enum: OrderType })
  type: OrderType;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.NEW })
  status: OrderStatus;

  @Column({ type: 'enum', enum: TradingMode })
  mode: TradingMode;

  @Column({ type: 'numeric', precision: 20, scale: 8 })
  price: number;

  @Column({ type: 'numeric', precision: 20, scale: 8 })
  amount: number;

  @Column({ type: 'numeric', precision: 20, scale: 8, default: 0 })
  filled: number;

  @Column({ type: 'numeric', precision: 20, scale: 8, default: 0 })
  remaining: number;

  @Column({ type: 'numeric', precision: 20, scale: 8, default: 0 })
  fee: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  feeCurrency: string;

  @Column({ type: 'text', nullable: true })
  reason: string; // 주문 사유

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  filledAt: Date;

  @OneToMany(() => OrderFillEntity, (fill) => fill.order)
  fills: OrderFillEntity[];
}
