import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async getDetailedHealth() {
    const dbStatus = await this.checkDatabase();

    return {
      status: dbStatus ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus ? 'connected' : 'disconnected',
      },
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
