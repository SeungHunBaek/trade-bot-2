import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { ExchangeEntity } from './exchange.entity';
import { ApiCredentialEntity } from './api-credential.entity';

@Entity('accounts')
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'uuid' })
  exchangeId: string;

  @ManyToOne(() => ExchangeEntity, (exchange) => exchange.accounts)
  @JoinColumn({ name: 'exchangeId' })
  exchange: ExchangeEntity;

  @OneToOne(() => ApiCredentialEntity, (credential) => credential.account)
  credential: ApiCredentialEntity;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isPaper: boolean; // 페이퍼 트레이딩 전용 계정

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
