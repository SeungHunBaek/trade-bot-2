import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { TradingMode } from '@passive-money/common';

import { AccountEntity } from './account.entity';

@Entity('balance_history')
@Index(['accountId', 'createdAt'])
export class BalanceHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  accountId: string;

  @ManyToOne(() => AccountEntity)
  @JoinColumn({ name: 'accountId' })
  account: AccountEntity;

  @Column({ type: 'varchar', length: 20 })
  exchange: string;

  @Column({ type: 'enum', enum: TradingMode })
  mode: TradingMode;

  @Column({ type: 'numeric', precision: 20, scale: 8 })
  totalBalance: number; // KRW 환산 총 잔고

  @Column({ type: 'numeric', precision: 20, scale: 8 })
  krwBalance: number;

  @Column({ type: 'numeric', precision: 20, scale: 8, default: 0 })
  btcBalance: number;

  @Column({ type: 'numeric', precision: 20, scale: 8, nullable: true })
  btcPrice: number;

  @Column({ type: 'jsonb', nullable: true })
  balances: Record<string, number>; // 전체 자산 스냅샷

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
