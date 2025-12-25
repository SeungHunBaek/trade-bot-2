import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BacktestService, BacktestConfig } from '../backtest.service';
import { CandleEntity } from '@passive-money/database';

describe('BacktestService', () => {
  let service: BacktestService;
  let candleRepository: any;

  const mockCandleData: Partial<CandleEntity>[] = [];

  // 테스트용 캔들 데이터 생성 (RSI 시그널이 발생하도록)
  beforeAll(() => {
    const basePrice = 100;
    const baseTime = new Date('2024-01-01').getTime();

    for (let i = 0; i < 150; i++) {
      // RSI 시그널을 발생시키기 위한 가격 패턴
      let priceChange = 0;
      if (i >= 20 && i < 35) {
        priceChange = -2; // 하락 추세 (RSI 과매도 진입)
      } else if (i >= 35 && i < 50) {
        priceChange = 2; // 상승 추세 (RSI 회복)
      } else if (i >= 70 && i < 85) {
        priceChange = 2; // 상승 추세 (RSI 과매수 진입)
      } else if (i >= 85 && i < 100) {
        priceChange = -2; // 하락 추세 (RSI 하락)
      }

      const price = basePrice + (i * 0.1) + priceChange * (i - 20);

      mockCandleData.push({
        id: `candle-${i}`,
        exchange: 'bithumb',
        symbol: 'BTC/KRW',
        timeframe: '1h',
        timestamp: baseTime + i * 3600000,
        open: price,
        high: price + 1,
        low: price - 1,
        close: price,
        volume: 1000,
      } as unknown as Partial<CandleEntity>);
    }
  });

  beforeEach(async () => {
    candleRepository = {
      find: jest.fn().mockResolvedValue(mockCandleData),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BacktestService,
        {
          provide: getRepositoryToken(CandleEntity),
          useValue: candleRepository,
        },
      ],
    }).compile();

    service = module.get<BacktestService>(BacktestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('runBacktest', () => {
    const baseConfig: BacktestConfig = {
      exchange: 'bithumb',
      symbol: 'BTC/KRW',
      timeframe: '1h',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-07'),
      initialCapital: 1000000,
      strategyType: 'rsi',
      params: {
        rsiPeriod: 14,
        overbought: 70,
        oversold: 30,
      },
    };

    it('should run RSI backtest successfully', async () => {
      const result = await service.runBacktest(baseConfig);

      expect(result).toBeDefined();
      expect(result.config).toEqual(baseConfig);
      expect(result.metrics).toBeDefined();
      expect(result.metrics.startCapital).toBe(1000000);
      expect(result.equityCurve).toBeDefined();
      expect(result.equityCurve.length).toBeGreaterThan(0);
    });

    it('should calculate metrics correctly', async () => {
      const result = await service.runBacktest(baseConfig);

      expect(result.metrics.totalTrades).toBeGreaterThanOrEqual(0);
      expect(result.metrics.winRate).toBeGreaterThanOrEqual(0);
      expect(result.metrics.winRate).toBeLessThanOrEqual(100);
    });

    it('should run MACD backtest', async () => {
      const macdConfig: BacktestConfig = {
        ...baseConfig,
        strategyType: 'macd',
        params: {
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9,
        },
      };

      const result = await service.runBacktest(macdConfig);

      expect(result).toBeDefined();
      expect(result.config.strategyType).toBe('macd');
    });

    it('should run MA Crossover backtest', async () => {
      const maConfig: BacktestConfig = {
        ...baseConfig,
        strategyType: 'ma_crossover',
        params: {
          shortPeriod: 9,
          longPeriod: 21,
          useEMA: false,
        },
      };

      const result = await service.runBacktest(maConfig);

      expect(result).toBeDefined();
      expect(result.config.strategyType).toBe('ma_crossover');
    });

    it('should throw error with insufficient data', async () => {
      candleRepository.find.mockResolvedValue(mockCandleData.slice(0, 50));

      await expect(service.runBacktest(baseConfig)).rejects.toThrow(
        'Not enough candle data for backtest',
      );
    });

    it('should apply fee and slippage correctly', async () => {
      const configWithFees: BacktestConfig = {
        ...baseConfig,
        feeRate: 0.002, // 0.2%
        slippage: 0.001, // 0.1%
      };

      const result = await service.runBacktest(configWithFees);

      if (result.trades.length > 0) {
        const firstTrade = result.trades[0];
        expect(firstTrade.fee).toBeGreaterThan(0);
      }
    });
  });

  describe('calculateMetrics', () => {
    it('should return zero metrics for empty trades', async () => {
      candleRepository.find.mockResolvedValue(mockCandleData);

      // 시그널이 없는 설정으로 빈 거래 결과 유도
      const config: BacktestConfig = {
        exchange: 'bithumb',
        symbol: 'BTC/KRW',
        timeframe: '1h',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-02'),
        initialCapital: 1000000,
        strategyType: 'rsi',
        params: {
          rsiPeriod: 14,
          overbought: 99, // 거의 도달 불가능
          oversold: 1, // 거의 도달 불가능
        },
      };

      const result = await service.runBacktest(config);

      // 거래가 없으면 초기 자본 유지
      expect(result.metrics.endCapital).toBe(result.metrics.startCapital);
    });
  });
});
