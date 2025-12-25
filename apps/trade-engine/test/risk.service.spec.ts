import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  RiskSettingEntity,
  PositionEntity,
  OrderEntity,
} from '@passive-money/database';
import { OrderSide } from '@passive-money/common';

import { RiskService } from '../src/modules/risk/risk.service';

describe('RiskService', () => {
  let service: RiskService;

  const mockRiskSettingRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockPositionRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockOrderRepository = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiskService,
        {
          provide: getRepositoryToken(RiskSettingEntity),
          useValue: mockRiskSettingRepository,
        },
        {
          provide: getRepositoryToken(PositionEntity),
          useValue: mockPositionRepository,
        },
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: mockOrderRepository,
        },
      ],
    }).compile();

    service = module.get<RiskService>(RiskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateOrder', () => {
    it('should pass risk check for valid order', async () => {
      mockRiskSettingRepository.findOne.mockResolvedValue(null); // 기본값 사용
      mockPositionRepository.find.mockResolvedValue([]);
      mockPositionRepository.findOne.mockResolvedValue(null);
      mockOrderRepository.count.mockResolvedValue(0);

      const result = await service.validateOrder({
        accountId: 'account-1',
        symbol: 'BTC/KRW',
        side: OrderSide.BUY,
        amount: 0.01,
        price: 50000000,
      });

      expect(result.passed).toBe(true);
      expect(result.checks.orderSize).toBe(true);
      expect(result.checks.dailyLoss).toBe(true);
      expect(result.checks.maxPosition).toBe(true);
      expect(result.checks.maxOpenOrders).toBe(true);
    });

    it('should fail when order size exceeds limit', async () => {
      // RiskSettingEntity는 비율 기반이므로, maxRiskPerTrade = 0.01 -> maxOrderSizeKrw = 1,000,000
      mockRiskSettingRepository.findOne.mockResolvedValue({
        maxRiskPerTrade: 0.01, // 1% of 100M = 1,000,000
        maxPositionSize: 0.2,
        dailyLossLimit: 0.03,
        maxOpenPositions: 10,
      });

      const result = await service.validateOrder({
        accountId: 'account-1',
        symbol: 'BTC/KRW',
        side: OrderSide.BUY,
        amount: 1,
        price: 50000000, // 5천만원 > 백만원 제한
      });

      expect(result.passed).toBe(false);
      expect(result.checks.orderSize).toBe(false);
    });

    it('should fail when max open orders exceeded', async () => {
      mockRiskSettingRepository.findOne.mockResolvedValue({
        maxRiskPerTrade: 0.5, // 5천만
        maxPositionSize: 0.5, // 5천만
        dailyLossLimit: 0.1, // 천만
        maxOpenPositions: 5,
      });
      mockPositionRepository.find.mockResolvedValue([]);
      mockPositionRepository.findOne.mockResolvedValue(null);
      mockOrderRepository.count.mockResolvedValue(5);

      const result = await service.validateOrder({
        accountId: 'account-1',
        symbol: 'BTC/KRW',
        side: OrderSide.BUY,
        amount: 0.01,
        price: 50000000,
      });

      expect(result.passed).toBe(false);
      expect(result.checks.maxOpenOrders).toBe(false);
    });

    it('should fail when max position size exceeded', async () => {
      mockRiskSettingRepository.findOne.mockResolvedValue({
        maxRiskPerTrade: 0.5, // 5천만
        maxPositionSize: 0.1, // 천만원 제한
        dailyLossLimit: 0.1,
        maxOpenPositions: 10,
      });
      mockPositionRepository.find.mockResolvedValue([]);
      mockPositionRepository.findOne.mockResolvedValue({
        amount: 0.1,
        entryPrice: 50000000, // 기존 5백만원
      });
      mockOrderRepository.count.mockResolvedValue(0);

      const result = await service.validateOrder({
        accountId: 'account-1',
        symbol: 'BTC/KRW',
        side: OrderSide.BUY,
        amount: 0.2,
        price: 50000000, // 추가 천만원 -> 총 1500만원 > 천만원
      });

      expect(result.passed).toBe(false);
      expect(result.checks.maxPosition).toBe(false);
    });
  });

  describe('getRiskSettings', () => {
    it('should return default settings when none exist', async () => {
      mockRiskSettingRepository.findOne.mockResolvedValue(null);

      const result = await service.getRiskSettings('account-1');

      expect(result.maxOrderSizeKrw).toBe(10000000);
      expect(result.maxPositionSizeKrw).toBe(50000000);
      expect(result.maxDailyLossKrw).toBe(1000000);
    });

    it('should return converted settings when exist', async () => {
      // RiskSettingEntity 비율 기반 설정
      mockRiskSettingRepository.findOne.mockResolvedValue({
        maxRiskPerTrade: 0.05, // 5% of 100M = 5,000,000
        maxPositionSize: 0.2, // 20% of 100M = 20,000,000
        dailyLossLimit: 0.005, // 0.5% of 100M = 500,000
        maxOpenPositions: 10,
      });

      const result = await service.getRiskSettings('account-1');

      expect(result.maxOrderSizeKrw).toBe(5000000);
      expect(result.maxPositionSizeKrw).toBe(20000000);
      expect(result.maxDailyLossKrw).toBe(500000);
    });
  });

  describe('getAccountRiskSummary', () => {
    it('should return risk summary', async () => {
      mockPositionRepository.find.mockResolvedValue([
        {
          amount: 0.1,
          entryPrice: 50000000,
          realizedPnl: 100000,
        },
        {
          amount: 0.2,
          entryPrice: 3000000,
          realizedPnl: -50000,
        },
      ]);
      mockOrderRepository.count.mockResolvedValue(3);
      mockRiskSettingRepository.findOne.mockResolvedValue(null);

      const result = await service.getAccountRiskSummary('account-1');

      expect(result.totalPositionValue).toBe(5600000); // 0.1*50M + 0.2*3M
      expect(result.dailyPnl).toBe(50000); // 100000 - 50000
      expect(result.openOrdersCount).toBe(3);
      expect(result.positionsCount).toBe(2);
    });
  });
});
