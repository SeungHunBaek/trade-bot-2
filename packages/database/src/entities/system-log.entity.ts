import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

@Entity('system_logs')
@Index(['level', 'createdAt'])
@Index(['service', 'createdAt'])
export class SystemLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: LogLevel, default: LogLevel.INFO })
  level: LogLevel;

  @Column({ type: 'varchar', length: 50 })
  service: string; // api-gateway, data-collector, trade-engine, etc.

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  context: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  stackTrace: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
