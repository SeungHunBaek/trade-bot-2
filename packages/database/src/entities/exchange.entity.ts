import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { AccountEntity } from './account.entity';

@Entity('exchanges')
export class ExchangeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string; // bithumb, bybit, okx

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 10 })
  country: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'numeric', precision: 10, scale: 6, default: 0.0025 })
  defaultFeeRate: number;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => AccountEntity, (account) => account.exchange)
  accounts: AccountEntity[];
}
