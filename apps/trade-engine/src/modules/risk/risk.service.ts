import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  RiskSettingEntity,
  PositionEntity,
  OrderEntity,
} from '@passive-money/database';
import { OrderSide, OrderStatus } from '@passive-money/common';

export interface RiskCheckResult {
  passed: boolean;
  reason?: string;
  checks: {
    orderSize: boolean;
    dailyLoss: boolean;
    maxPosition: boolean;
    maxOpenOrders: boolean;
  };
}

export interface OrderRiskParams {
  accountId: string;
  symbol: string;
  side: OrderSide;
  amount: number;
  price?: number;
}

interface RiskSettingsConfig {
  maxOrderSizeKrw: number;
  maxPositionSizeKrw: number;
  maxDailyLossKrw: number;
  maxDailyLossPercent: number;
  maxOpenOrders: number;
  maxPositionsCount: number;
}

@Injectable()
export class RiskService {
  private readonly logger = new Logger(RiskService.name);

  // 기본 리스크 설정값
  private readonly defaultRiskSettings: RiskSettingsConfig = {
    maxOrderSizeKrw: 10000000, // 최대 주문 크기 (KRW)
    maxPositionSizeKrw: 50000000, // 최대 포지션 크기 (KRW)
    maxDailyLossKrw: 1000000, // 일일 최대 손실 (KRW)
    maxDailyLossPercent: 5, // 일일 최대 손실 비율 (%)
    maxOpenOrders: 10, // 최대 미체결 주문 수
    maxPositionsCount: 5, // 최대 포지션 수
  };

  constructor(
    @InjectRepository(RiskSettingEntity)
    private readonly riskSettingRepository: Repository<RiskSettingEntity>,
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async validateOrder(params: OrderRiskParams): Promise<RiskCheckResult> {
    const { accountId, symbol, side, amount, price } = params;

    const result: RiskCheckResult = {
      passed: true,
      checks: {
        orderSize: true,
        dailyLoss: true,
        maxPosition: true,
        maxOpenOrders: true,
      },
    };

    try {
      // 리스크 설정 조회
      const riskSettings = await this.getRiskSettings(accountId);

      // 1. 주문 크기 검증
      const orderValue = price ? amount * price : amount;
      if (orderValue > riskSettings.maxOrderSizeKrw) {
        result.passed = false;
        result.checks.orderSize = false;
        result.reason = `Order size ${orderValue} exceeds max ${riskSettings.maxOrderSizeKrw}`;
        return result;
      }

      // 2. 일일 손실 검증
      const dailyLossCheck = await this.checkDailyLoss(
        accountId,
        riskSettings.maxDailyLossKrw,
      );
      if (!dailyLossCheck.passed) {
        result.passed = false;
        result.checks.dailyLoss = false;
        result.reason = dailyLossCheck.reason;
        return result;
      }

      // 3. 최대 포지션 크기 검증 (매수 시)
      if (side === OrderSide.BUY) {
        const positionCheck = await this.checkMaxPosition(
          accountId,
          symbol,
          orderValue,
          riskSettings.maxPositionSizeKrw,
        );
        if (!positionCheck.passed) {
          result.passed = false;
          result.checks.maxPosition = false;
          result.reason = positionCheck.reason;
          return result;
        }
      }

      // 4. 최대 미체결 주문 수 검증
      const openOrdersCheck = await this.checkMaxOpenOrders(
        accountId,
        riskSettings.maxOpenOrders,
      );
      if (!openOrdersCheck.passed) {
        result.passed = false;
        result.checks.maxOpenOrders = false;
        result.reason = openOrdersCheck.reason;
        return result;
      }

      return result;
    } catch (error) {
      this.logger.error('Risk validation error:', error);
      // 에러 시에도 주문을 허용하되 로깅
      return result;
    }
  }

  async getRiskSettings(accountId: string): Promise<RiskSettingsConfig> {
    const setting = await this.riskSettingRepository.findOne({
      where: { accountId },
    });

    if (!setting) {
      return this.defaultRiskSettings;
    }

    // RiskSettingEntity의 비율 기반 설정을 KRW 기반으로 변환
    // 기본 포트폴리오 크기를 100,000,000원(1억)으로 가정
    const basePortfolio = 100000000;

    return {
      maxOrderSizeKrw: basePortfolio * (setting.maxRiskPerTrade || 0.01),
      maxPositionSizeKrw: basePortfolio * (setting.maxPositionSize || 0.2),
      maxDailyLossKrw: basePortfolio * (setting.dailyLossLimit || 0.03),
      maxDailyLossPercent: (setting.dailyLossLimit || 0.03) * 100,
      maxOpenOrders: setting.maxOpenPositions || 10,
      maxPositionsCount: setting.maxOpenPositions || 5,
    };
  }

  async updateRiskSettings(
    accountId: string,
    settings: Partial<RiskSettingsConfig>,
  ): Promise<RiskSettingEntity> {
    let riskSetting = await this.riskSettingRepository.findOne({
      where: { accountId },
    });

    // KRW 기반 설정을 비율 기반으로 변환 (역변환)
    const basePortfolio = 100000000;

    if (!riskSetting) {
      riskSetting = this.riskSettingRepository.create({
        accountId,
        maxRiskPerTrade: settings.maxOrderSizeKrw
          ? settings.maxOrderSizeKrw / basePortfolio
          : 0.01,
        maxPositionSize: settings.maxPositionSizeKrw
          ? settings.maxPositionSizeKrw / basePortfolio
          : 0.2,
        dailyLossLimit: settings.maxDailyLossKrw
          ? settings.maxDailyLossKrw / basePortfolio
          : 0.03,
        maxOpenPositions: settings.maxOpenOrders || 10,
      });
    } else {
      if (settings.maxOrderSizeKrw) {
        riskSetting.maxRiskPerTrade = settings.maxOrderSizeKrw / basePortfolio;
      }
      if (settings.maxPositionSizeKrw) {
        riskSetting.maxPositionSize = settings.maxPositionSizeKrw / basePortfolio;
      }
      if (settings.maxDailyLossKrw) {
        riskSetting.dailyLossLimit = settings.maxDailyLossKrw / basePortfolio;
      }
      if (settings.maxOpenOrders) {
        riskSetting.maxOpenPositions = settings.maxOpenOrders;
      }
    }

    return this.riskSettingRepository.save(riskSetting);
  }

  private async checkDailyLoss(
    accountId: string,
    maxDailyLossKrw: number,
  ): Promise<{ passed: boolean; reason?: string }> {
    // 오늘의 실현 손익 합계
    const positions = await this.positionRepository.find({
      where: { accountId },
    });

    let dailyLoss = 0;
    for (const position of positions) {
      if (position.realizedPnl < 0) {
        // 간단화: 실현 손익이 음수인 것만 합산
        // 실제로는 오늘 발생한 손실만 계산해야 함
        dailyLoss += Math.abs(position.realizedPnl);
      }
    }

    if (dailyLoss >= maxDailyLossKrw) {
      return {
        passed: false,
        reason: `Daily loss ${dailyLoss} exceeds max ${maxDailyLossKrw}`,
      };
    }

    return { passed: true };
  }

  private async checkMaxPosition(
    accountId: string,
    symbol: string,
    additionalValue: number,
    maxPositionSizeKrw: number,
  ): Promise<{ passed: boolean; reason?: string }> {
    const position = await this.positionRepository.findOne({
      where: { accountId, symbol },
    });

    const currentValue = position ? position.amount * position.entryPrice : 0;
    const newValue = currentValue + additionalValue;

    if (newValue > maxPositionSizeKrw) {
      return {
        passed: false,
        reason: `Position value ${newValue} would exceed max ${maxPositionSizeKrw}`,
      };
    }

    return { passed: true };
  }

  private async checkMaxOpenOrders(
    accountId: string,
    maxOpenOrders: number,
  ): Promise<{ passed: boolean; reason?: string }> {
    const openOrdersCount = await this.orderRepository.count({
      where: [
        { accountId, status: OrderStatus.NEW },
        { accountId, status: OrderStatus.OPEN },
        { accountId, status: OrderStatus.PARTIAL },
      ],
    });

    if (openOrdersCount >= maxOpenOrders) {
      return {
        passed: false,
        reason: `Open orders count ${openOrdersCount} would exceed max ${maxOpenOrders}`,
      };
    }

    return { passed: true };
  }

  async getAccountRiskSummary(accountId: string): Promise<{
    totalPositionValue: number;
    dailyPnl: number;
    openOrdersCount: number;
    positionsCount: number;
    riskSettings: RiskSettingsConfig;
  }> {
    const positions = await this.positionRepository.find({
      where: { accountId },
    });

    let totalPositionValue = 0;
    let dailyPnl = 0;

    for (const position of positions) {
      if (position.amount > 0) {
        totalPositionValue += position.amount * position.entryPrice;
      }
      dailyPnl += position.realizedPnl;
    }

    const openOrdersCount = await this.orderRepository.count({
      where: [
        { accountId, status: OrderStatus.NEW },
        { accountId, status: OrderStatus.OPEN },
        { accountId, status: OrderStatus.PARTIAL },
      ],
    });

    const positionsCount = positions.filter((p) => p.amount > 0).length;
    const riskSettings = await this.getRiskSettings(accountId);

    return {
      totalPositionValue,
      dailyPnl,
      openOrdersCount,
      positionsCount,
      riskSettings,
    };
  }
}
