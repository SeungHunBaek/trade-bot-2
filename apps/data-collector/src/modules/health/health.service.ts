import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  uptime: number;
  timestamp: string;
}

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  check(): HealthStatus {
    return {
      status: 'healthy',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  }

  async checkReadiness(): Promise<{
    status: string;
    checks: Record<string, boolean>;
  }> {
    const checks: Record<string, boolean> = {};

    // PostgreSQL 연결 확인
    try {
      await this.dataSource.query('SELECT 1');
      checks.database = true;
    } catch {
      checks.database = false;
    }

    const allHealthy = Object.values(checks).every((v) => v);

    return {
      status: allHealthy ? 'ready' : 'not_ready',
      checks,
    };
  }
}
