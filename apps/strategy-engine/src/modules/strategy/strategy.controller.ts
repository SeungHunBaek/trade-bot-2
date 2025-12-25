import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import {
  StrategyService,
  CreateStrategyDto,
  CreateStrategyInstanceDto,
} from './strategy.service';

@Controller('strategies')
export class StrategyController {
  constructor(private readonly strategyService: StrategyService) {}

  // ============ Strategy Endpoints ============

  @Post()
  async createStrategy(@Body() dto: CreateStrategyDto) {
    return this.strategyService.createStrategy(dto);
  }

  @Get()
  async getStrategies() {
    return this.strategyService.getStrategies();
  }

  @Get(':id')
  async getStrategy(@Param('id') id: string) {
    return this.strategyService.getStrategy(id);
  }

  @Put(':id')
  async updateStrategy(
    @Param('id') id: string,
    @Body() dto: Partial<CreateStrategyDto>,
  ) {
    return this.strategyService.updateStrategy(id, dto);
  }

  @Delete(':id')
  async deactivateStrategy(@Param('id') id: string) {
    await this.strategyService.deactivateStrategy(id);
    return { success: true };
  }

  // ============ Version Endpoints ============

  @Post(':id/versions')
  async createVersion(
    @Param('id') strategyId: string,
    @Body() body: { version: string; params: Record<string, unknown>; changelog?: string },
  ) {
    return this.strategyService.createVersion(
      strategyId,
      body.version,
      body.params,
      body.changelog,
    );
  }

  @Post('versions/:versionId/approve')
  async approveVersion(@Param('versionId') versionId: string) {
    return this.strategyService.approveVersion(versionId);
  }

  // ============ Instance Endpoints ============

  @Post('instances')
  async createInstance(@Body() dto: CreateStrategyInstanceDto) {
    return this.strategyService.createInstance(dto);
  }

  @Get('instances/running')
  async getRunningInstances() {
    return this.strategyService.getRunningInstances();
  }

  @Get('instances/account/:accountId')
  async getInstancesByAccount(@Param('accountId') accountId: string) {
    return this.strategyService.getInstancesByAccount(accountId);
  }

  @Get('instances/:id')
  async getInstance(@Param('id') id: string) {
    return this.strategyService.getInstance(id);
  }

  @Post('instances/:id/start')
  async startInstance(@Param('id') id: string) {
    return this.strategyService.startInstance(id);
  }

  @Post('instances/:id/stop')
  async stopInstance(@Param('id') id: string) {
    return this.strategyService.stopInstance(id);
  }

  @Put('instances/:id/status')
  async updateInstanceStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.strategyService.updateInstanceStatus(id, body.status);
  }

  @Put('instances/:id/params')
  async updateInstanceParams(
    @Param('id') id: string,
    @Body() body: { params: Record<string, unknown> },
  ) {
    return this.strategyService.updateInstanceParams(id, body.params);
  }
}
