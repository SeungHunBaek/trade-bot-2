import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { StrategyVersionEntity } from './strategy-version.entity';
import { StrategyInstanceEntity } from './strategy-instance.entity';

@Entity('strategies')
export class StrategyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // signal, momentum, reversion, market_making

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  defaultParams: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => StrategyVersionEntity, (version) => version.strategy)
  versions: StrategyVersionEntity[];

  @OneToMany(() => StrategyInstanceEntity, (instance) => instance.strategy)
  instances: StrategyInstanceEntity[];
}
