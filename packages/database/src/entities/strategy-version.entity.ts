import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { StrategyEntity } from './strategy.entity';

@Entity('strategy_versions')
export class StrategyVersionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  strategyId: string;

  @ManyToOne(() => StrategyEntity, (strategy) => strategy.versions)
  @JoinColumn({ name: 'strategyId' })
  strategy: StrategyEntity;

  @Column({ type: 'varchar', length: 20 })
  version: string; // v1.0.0

  @Column({ type: 'text', nullable: true })
  changelog: string;

  @Column({ type: 'jsonb' })
  params: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  backtestResult: {
    sharpeRatio?: number;
    maxDrawdown?: number;
    winRate?: number;
    totalReturn?: number;
    totalTrades?: number;
  };

  @Column({ type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
