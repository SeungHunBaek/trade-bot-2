import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  StrategyEntity,
  StrategyVersionEntity,
  StrategyInstanceEntity,
  StrategyInstanceStatus,
} from '@passive-money/database';

export interface CreateStrategyDto {
  name: string;
  description?: string;
  type: string;
  defaultParams?: Record<string, unknown>;
}

export interface CreateStrategyInstanceDto {
  strategyId: string;
  accountId: string;
  symbols: string[];
  params: Record<string, unknown>;
}

@Injectable()
export class StrategyService {
  private readonly logger = new Logger(StrategyService.name);

  constructor(
    @InjectRepository(StrategyEntity)
    private readonly strategyRepository: Repository<StrategyEntity>,
    @InjectRepository(StrategyVersionEntity)
    private readonly versionRepository: Repository<StrategyVersionEntity>,
    @InjectRepository(StrategyInstanceEntity)
    private readonly instanceRepository: Repository<StrategyInstanceEntity>,
  ) {}

  // ============ Strategy CRUD ============

  async createStrategy(dto: CreateStrategyDto): Promise<StrategyEntity> {
    const strategy = this.strategyRepository.create({
      name: dto.name,
      description: dto.description,
      type: dto.type,
      defaultParams: dto.defaultParams,
      isActive: true,
    });

    return this.strategyRepository.save(strategy);
  }

  async getStrategies(): Promise<StrategyEntity[]> {
    return this.strategyRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getStrategy(id: string): Promise<StrategyEntity | null> {
    return this.strategyRepository.findOne({
      where: { id },
      relations: ['versions', 'instances'],
    });
  }

  async updateStrategy(
    id: string,
    updates: Partial<CreateStrategyDto>,
  ): Promise<StrategyEntity> {
    const strategy = await this.strategyRepository.findOne({ where: { id } });
    if (!strategy) {
      throw new NotFoundException(`Strategy ${id} not found`);
    }

    Object.assign(strategy, updates);
    return this.strategyRepository.save(strategy);
  }

  async deactivateStrategy(id: string): Promise<void> {
    await this.strategyRepository.update(id, { isActive: false });
  }

  // ============ Strategy Version ============

  async createVersion(
    strategyId: string,
    version: string,
    params: Record<string, unknown>,
    changelog?: string,
  ): Promise<StrategyVersionEntity> {
    const strategyVersion = this.versionRepository.create({
      strategyId,
      version,
      params,
      changelog,
      isApproved: false,
    });

    return this.versionRepository.save(strategyVersion);
  }

  async approveVersion(versionId: string): Promise<StrategyVersionEntity> {
    const version = await this.versionRepository.findOne({
      where: { id: versionId },
    });
    if (!version) {
      throw new NotFoundException(`Version ${versionId} not found`);
    }

    version.isApproved = true;
    version.approvedAt = new Date();
    return this.versionRepository.save(version);
  }

  // ============ Strategy Instance ============

  async createInstance(
    dto: CreateStrategyInstanceDto,
  ): Promise<StrategyInstanceEntity> {
    const instance = this.instanceRepository.create({
      strategyId: dto.strategyId,
      accountId: dto.accountId,
      symbols: dto.symbols,
      params: dto.params,
      status: StrategyInstanceStatus.DRAFT,
      isRunning: false,
    });

    const savedInstance = await this.instanceRepository.save(instance);
    return savedInstance;
  }

  async getInstance(id: string): Promise<StrategyInstanceEntity | null> {
    return this.instanceRepository.findOne({
      where: { id },
      relations: ['strategy'],
    });
  }

  async getInstancesByAccount(accountId: string): Promise<StrategyInstanceEntity[]> {
    return this.instanceRepository.find({
      where: { accountId },
      relations: ['strategy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRunningInstances(): Promise<StrategyInstanceEntity[]> {
    return this.instanceRepository.find({
      where: { isRunning: true },
      relations: ['strategy'],
    });
  }

  async startInstance(id: string): Promise<StrategyInstanceEntity> {
    const instance = await this.instanceRepository.findOne({ where: { id } });
    if (!instance) {
      throw new NotFoundException(`Instance ${id} not found`);
    }

    instance.isRunning = true;
    instance.startedAt = new Date();
    instance.stoppedAt = undefined as unknown as Date;

    this.logger.log(`Starting strategy instance ${id}`);

    return this.instanceRepository.save(instance);
  }

  async stopInstance(id: string): Promise<StrategyInstanceEntity> {
    const instance = await this.instanceRepository.findOne({ where: { id } });
    if (!instance) {
      throw new NotFoundException(`Instance ${id} not found`);
    }

    instance.isRunning = false;
    instance.stoppedAt = new Date();

    this.logger.log(`Stopping strategy instance ${id}`);

    return this.instanceRepository.save(instance);
  }

  async updateInstanceStatus(
    id: string,
    status: string,
  ): Promise<StrategyInstanceEntity> {
    const instance = await this.instanceRepository.findOne({ where: { id } });
    if (!instance) {
      throw new NotFoundException(`Instance ${id} not found`);
    }

    instance.status = status as StrategyInstanceEntity['status'];
    return this.instanceRepository.save(instance);
  }

  async updateInstanceParams(
    id: string,
    params: Record<string, unknown>,
  ): Promise<StrategyInstanceEntity> {
    const instance = await this.instanceRepository.findOne({ where: { id } });
    if (!instance) {
      throw new NotFoundException(`Instance ${id} not found`);
    }

    instance.params = params;
    return this.instanceRepository.save(instance);
  }
}
