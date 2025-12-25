import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Root')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: '서버 상태 확인' })
  @ApiResponse({ status: 200, description: '서버 정보 반환' })
  getInfo() {
    return {
      name: 'Passive Money API Gateway',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }
}
