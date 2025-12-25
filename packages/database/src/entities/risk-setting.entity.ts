import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

import { AccountEntity } from './account.entity';

@Entity('risk_settings')
@Unique(['accountId'])
export class RiskSettingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  accountId: string;

  @ManyToOne(() => AccountEntity)
  @JoinColumn({ name: 'accountId' })
  account: AccountEntity;

  // Risk per trade: 1% default, max 2%
  @Column({ type: 'numeric', precision: 5, scale: 4, default: 0.01 })
  maxRiskPerTrade: number;

  // Daily loss limit: 3-5%
  @Column({ type: 'numeric', precision: 5, scale: 4, default: 0.03 })
  dailyLossLimit: number;

  // Position limit: 20-25% of portfolio
  @Column({ type: 'numeric', precision: 5, scale: 4, default: 0.2 })
  maxPositionSize: number;

  // Max position per symbol
  @Column({ type: 'numeric', precision: 5, scale: 4, default: 0.1 })
  maxPositionPerSymbol: number;

  // Slippage tolerance: 0.2-0.5%
  @Column({ type: 'numeric', precision: 5, scale: 4, default: 0.005 })
  slippageTolerance: number;

  // 최대 동시 포지션 수
  @Column({ type: 'int', default: 5 })
  maxOpenPositions: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
