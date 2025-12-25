import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CandleEntity } from '@passive-money/database';
import { ExchangeId } from '@passive-money/common';

import { CandleService } from '../src/modules/candle/candle.service';

describe('CandleService', () => {
  let service: CandleService;

  const mockRepository = {
    findOne: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orUpdate: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ identifiers: [] }),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandleService,
        {
          provide: getRepositoryToken(CandleEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CandleService>(CandleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLatestCandle', () => {
    it('should return the latest candle', async () => {
      const mockCandle = {
        id: '1',
        exchange: ExchangeId.BITHUMB,
        symbol: 'BTC/KRW',
        timeframe: '1m',
        timestamp: Date.now(),
        open: 50000000,
        high: 51000000,
        low: 49000000,
        close: 50500000,
        volume: 100,
      };

      mockRepository.findOne.mockResolvedValue(mockCandle);

      const result = await service.getLatestCandle(
        ExchangeId.BITHUMB,
        'BTC/KRW',
        '1m',
      );

      expect(result).toEqual(mockCandle);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          exchange: ExchangeId.BITHUMB,
          symbol: 'BTC/KRW',
          timeframe: '1m',
        },
        order: { timestamp: 'DESC' },
      });
    });

    it('should return null if no candle found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getLatestCandle(
        ExchangeId.BITHUMB,
        'BTC/KRW',
        '1m',
      );

      expect(result).toBeNull();
    });
  });

  describe('getCandleCount', () => {
    it('should return candle count', async () => {
      mockRepository.count.mockResolvedValue(1000);

      const result = await service.getCandleCount(
        ExchangeId.BITHUMB,
        'BTC/KRW',
        '1m',
      );

      expect(result).toBe(1000);
      expect(mockRepository.count).toHaveBeenCalledWith({
        where: {
          exchange: ExchangeId.BITHUMB,
          symbol: 'BTC/KRW',
          timeframe: '1m',
        },
      });
    });
  });

  describe('saveCandles', () => {
    it('should save candles with upsert', async () => {
      const candles = [
        {
          exchange: ExchangeId.BITHUMB,
          symbol: 'BTC/KRW',
          timeframe: '1m',
          timestamp: Date.now(),
          open: 50000000,
          high: 51000000,
          low: 49000000,
          close: 50500000,
          volume: 100,
        },
      ];

      const result = await service.saveCandles(candles);

      expect(result).toBe(0); // mock returns empty identifiers
    });

    it('should return 0 for empty candles array', async () => {
      const result = await service.saveCandles([]);
      expect(result).toBe(0);
    });
  });
});
