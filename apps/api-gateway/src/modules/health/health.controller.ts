import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: '헬스체크' })
  @ApiResponse({ status: 200, description: '서비스 상태 정상' })
  check() {
    return this.healthService.check();
  }
}
