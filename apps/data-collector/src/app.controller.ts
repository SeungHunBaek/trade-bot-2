import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot(): { service: string; status: string; timestamp: string } {
    return {
      service: 'data-collector',
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }
}
