import { calculateMACD, generateMACDSignal } from '../macd';
import { OHLCV, MACDResult } from '../types';

describe('MACD Indicator', () => {
  const generateCandles = (count: number, basePrice: number = 100): OHLCV[] => {
    const candles: OHLCV[] = [];
    let price = basePrice;

    for (let i = 0; i < count; i++) {
      const change = (Math.random() - 0.5) * 10;
      price += change;
      candles.push({
        timestamp: Date.now() + i * 60000,
        open: price,
        high: price + Math.abs(change) / 2,
        low: price - Math.abs(change) / 2,
        close: price + change / 4,
        volume: 1000 + Math.random() * 1000,
      });
    }

    return candles;
  };

  describe('calculateMACD', () => {
    it('should return empty array for insufficient data', () => {
      const candles = generateCandles(20);
      const result = calculateMACD(candles);
      expect(result).toHaveLength(0);
    });

    it('should calculate MACD with default periods', () => {
      const candles = generateCandles(50);
      const result = calculateMACD(candles);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(typeof r.macd).toBe('number');
        expect(typeof r.signal).toBe('number');
        expect(typeof r.histogram).toBe('number');
        expect(r.histogram).toBeCloseTo(r.macd - r.signal, 5);
      });
    });

    it('should calculate MACD with custom periods', () => {
      const candles = generateCandles(50);
      const result = calculateMACD(candles, 8, 17, 9);

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('generateMACDSignal', () => {
    it('should generate buy signal on bullish crossover', () => {
      // histogram이 음수에서 양수로 전환될 때 매수 시그널
      const macdResults: MACDResult[] = [
        { timestamp: 1, macd: -2, signal: -1, histogram: -1 },
        { timestamp: 2, macd: -0.5, signal: -0.3, histogram: -0.2 },
        { timestamp: 3, macd: 0.5, signal: 0.1, histogram: 0.4 },
      ];

      const signals = generateMACDSignal(macdResults);
      const lastSignal = signals[signals.length - 1];

      expect(lastSignal.signal).toBe(1);
    });

    it('should generate sell signal on bearish crossover', () => {
      // histogram이 양수에서 음수로 전환될 때 매도 시그널
      const macdResults: MACDResult[] = [
        { timestamp: 1, macd: 2, signal: 1, histogram: 1 },
        { timestamp: 2, macd: 0.5, signal: 0.3, histogram: 0.2 },
        { timestamp: 3, macd: -0.5, signal: -0.1, histogram: -0.4 },
      ];

      const signals = generateMACDSignal(macdResults);
      const lastSignal = signals[signals.length - 1];

      expect(lastSignal.signal).toBe(-1);
    });

    it('should return 0 signal when no crossover', () => {
      const macdResults: MACDResult[] = [
        { timestamp: 1, macd: 1, signal: 0.5, histogram: 0.5 },
        { timestamp: 2, macd: 1.2, signal: 0.7, histogram: 0.5 },
        { timestamp: 3, macd: 1.5, signal: 1.0, histogram: 0.5 },
      ];

      const signals = generateMACDSignal(macdResults);
      const lastSignal = signals[signals.length - 1];

      expect(lastSignal.signal).toBe(0);
    });
  });
});
