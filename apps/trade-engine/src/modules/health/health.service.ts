import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  getDetailedHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'trade-engine',
      version: '0.0.1',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}
