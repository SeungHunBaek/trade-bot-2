import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { AccountEntity } from './account.entity';

@Entity('api_credentials')
export class ApiCredentialEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  accountId: string;

  @OneToOne(() => AccountEntity, (account) => account.credential)
  @JoinColumn({ name: 'accountId' })
  account: AccountEntity;

  // TODO: 암호화 적용 필요
  @Column({ type: 'varchar', length: 255 })
  accessKey: string;

  @Column({ type: 'varchar', length: 255 })
  secretKey: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passphrase: string; // OKX용

  @Column({ type: 'boolean', default: true })
  isValid: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastValidatedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
