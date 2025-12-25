import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Entity('candles')
@Unique(['exchange', 'symbol', 'timeframe', 'timestamp'])
@Index(['exchange', 'symbol', 'timeframe'])
@Index(['timestamp'])
export class CandleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  exchange: string;

  @Column({ type: 'varchar', length: 20 })
  symbol: string;

  @Column({ type: 'varchar', length: 10 })
  timeframe: string;

  @Column({ type: 'bigint' })
  timestamp: number;

  @Column({ type: 'numeric', precision: 20, scale: 8 })
  open: number;

  @Column({ type: 'numeric', precision: 20, scale: 8 })
  high: number;

  @Column({ type: 'numeric', precision: 20, scale: 8 })
  low: number;

  @Column({ type: 'numeric', precision: 20, scale: 8 })
  close: number;

  @Column({ type: 'numeric', precision: 20, scale: 8 })
  volume: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
