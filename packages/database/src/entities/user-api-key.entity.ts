import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { UserEntity } from './user.entity';

@Entity('user_api_keys')
export class UserApiKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  apiKey: string;

  @Column({ type: 'varchar', length: 128 })
  secretKey: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastUsedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
