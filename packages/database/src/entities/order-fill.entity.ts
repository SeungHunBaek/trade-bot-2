import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { OrderSide } from '@passive-money/common';

import { OrderEntity } from './order.entity';

@Entity('order_fills')
@Index(['orderId'])
@Index(['createdAt'])
export class OrderFillEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  externalFillId: string; // 거래소 체결 ID

  @Column({ type: 'uuid' })
  orderId: string;

  @ManyToOne(() => OrderEntity, (order) => order.fills)
  @JoinColumn({ name: 'orderId' })
  order: OrderEntity;

  @Column({ type: 'varchar', length: 20 })
  exchange: string;

  @Column({ type: 'varchar', length: 20 })
  symbol: string;

  @Column({ type: 'enum', enum: OrderSide })
  side: OrderSide;

  @Column({ type: 'numeric', precision: 20, scale: 8 })
  price: number;

  @Column({ type: 'numeric', precision: 20, scale: 8 })
  amount: number;

  @Column({ type: 'numeric', precision: 20, scale: 8 })
  fee: number;

  @Column({ type: 'varchar', length: 10 })
  feeCurrency: string;

  @Column({ type: 'bigint' })
  timestamp: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
