import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { PositionEntity, OrderEntity } from '@passive-money/database';
import { ExchangeId, OrderSide, TradingMode } from '@passive-money/common';

import { PositionService } from '../src/modules/position/position.service';

describe('PositionService', () => {
  let service: PositionService;

  const mockPositionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockOrderRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositionService,
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

    service = module.get<PositionService>(PositionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPosition', () => {
    it('should return position for account and symbol', async () => {
      const mockPosition = {
        id: 'position-1',
        accountId: 'account-1',
        exchange: ExchangeId.BITHUMB,
        symbol: 'BTC/KRW',
        amount: 0.5,
        entryPrice: 50000000,
      };

      mockPositionRepository.findOne.mockResolvedValue(mockPosition);

      const result = await service.getPosition(
        'account-1',
        ExchangeId.BITHUMB,
        'BTC/KRW',
      );

      expect(result).toEqual(mockPosition);
    });

    it('should return null for non-existent position', async () => {
      mockPositionRepository.findOne.mockResolvedValue(null);

      const result = await service.getPosition(
        'account-1',
        ExchangeId.BITHUMB,
        'ETH/KRW',
      );

      expect(result).toBeNull();
    });
  });

  describe('getOpenPositions', () => {
    it('should return positions with isOpen = true', async () => {
      const mockPositions = [
        { id: 'pos-1', amount: 0.5, symbol: 'BTC/KRW', isOpen: true },
        { id: 'pos-3', amount: 1.0, symbol: 'XRP/KRW', isOpen: true },
      ];

      mockPositionRepository.find.mockResolvedValue(mockPositions);

      const result = await service.getOpenPositions('account-1');

      expect(result).toHaveLength(2);
      expect(result[0].symbol).toBe('BTC/KRW');
      expect(result[1].symbol).toBe('XRP/KRW');
      expect(mockPositionRepository.find).toHaveBeenCalledWith({
        where: { accountId: 'account-1', isOpen: true },
      });
    });
  });

  describe('updatePositionFromFill', () => {
    it('should create new position on first buy', async () => {
      mockPositionRepository.findOne.mockResolvedValue(null);

      mockPositionRepository.create.mockReturnValue({
        accountId: 'account-1',
        exchange: ExchangeId.BITHUMB,
        symbol: 'BTC/KRW',
        side: OrderSide.BUY,
        mode: TradingMode.LIVE,
        amount: 0,
        entryPrice: 0,
        realizedPnl: 0,
        isOpen: true,
        openedAt: new Date(),
      });
      mockPositionRepository.save.mockImplementation((pos) =>
        Promise.resolve({ ...pos }),
      );

      const result = await service.updatePositionFromFill(
        'account-1',
        ExchangeId.BITHUMB,
        'BTC/KRW',
        OrderSide.BUY,
        0.1,
        50000000,
        0,
      );

      expect(result.amount).toBe(0.1);
      expect(result.entryPrice).toBe(50000000);
    });

    it('should increase position on additional buy', async () => {
      const existingPosition = {
        accountId: 'account-1',
        exchange: ExchangeId.BITHUMB,
        symbol: 'BTC/KRW',
        side: OrderSide.BUY,
        amount: 0.1,
        entryPrice: 50000000,
        realizedPnl: 0,
        isOpen: true,
      };

      mockPositionRepository.findOne.mockResolvedValue(existingPosition);
      mockPositionRepository.save.mockImplementation((pos) =>
        Promise.resolve(pos),
      );

      const result = await service.updatePositionFromFill(
        'account-1',
        ExchangeId.BITHUMB,
        'BTC/KRW',
        OrderSide.BUY,
        0.1,
        60000000,
        0,
      );

      expect(result.amount).toBe(0.2);
      // Average: (50000000 * 0.1 + 60000000 * 0.1) / 0.2 = 55000000
      expect(result.entryPrice).toBe(55000000);
    });

    it('should decrease position and calculate pnl on sell', async () => {
      const existingPosition = {
        accountId: 'account-1',
        exchange: ExchangeId.BITHUMB,
        symbol: 'BTC/KRW',
        side: OrderSide.BUY,
        amount: 0.2,
        entryPrice: 50000000,
        realizedPnl: 0,
        isOpen: true,
      };

      mockPositionRepository.findOne.mockResolvedValue(existingPosition);
      mockPositionRepository.save.mockImplementation((pos) =>
        Promise.resolve(pos),
      );

      const result = await service.updatePositionFromFill(
        'account-1',
        ExchangeId.BITHUMB,
        'BTC/KRW',
        OrderSide.SELL,
        0.1,
        55000000,
        1000, // fee
      );

      expect(result.amount).toBe(0.1);
      // PnL: (55000000 - 50000000) * 0.1 - 1000 = 499000
      expect(result.realizedPnl).toBe(499000);
    });
  });

  describe('calculateUnrealizedPnl', () => {
    it('should calculate unrealized pnl', async () => {
      const position = {
        amount: 0.1,
        entryPrice: 50000000,
      } as PositionEntity;

      const result = await service.calculateUnrealizedPnl(position, 55000000);

      expect(result.unrealizedPnl).toBe(500000);
      expect(result.unrealizedPnlPercent).toBe(10);
    });

    it('should return 0 for empty position', async () => {
      const position = {
        amount: 0,
        entryPrice: 0,
      } as PositionEntity;

      const result = await service.calculateUnrealizedPnl(position, 55000000);

      expect(result.unrealizedPnl).toBe(0);
      expect(result.unrealizedPnlPercent).toBe(0);
    });
  });
});
