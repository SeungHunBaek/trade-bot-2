import { calculateRSI, generateRSISignal } from '../rsi';
import { OHLCV } from '../types';

describe('RSI Indicator', () => {
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

  describe('calculateRSI', () => {
    it('should return empty array for insufficient data', () => {
      const candles = generateCandles(10);
      const result = calculateRSI(candles, 14);
      expect(result).toHaveLength(0);
    });

    it('should calculate RSI correctly with default period', () => {
      const candles = generateCandles(50);
      const result = calculateRSI(candles);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.value).toBeGreaterThanOrEqual(0);
        expect(r.value).toBeLessThanOrEqual(100);
      });
    });

    it('should calculate RSI with custom period', () => {
      const candles = generateCandles(30);
      const result = calculateRSI(candles, 7);

      expect(result.length).toBeGreaterThan(0);
    });

    it('should return RSI close to 50 for flat price', () => {
      const candles: OHLCV[] = [];
      let price = 100;

      for (let i = 0; i < 30; i++) {
        const change = i % 2 === 0 ? 1 : -1;
        price += change;
        candles.push({
          timestamp: Date.now() + i * 60000,
          open: price,
          high: price + 0.5,
          low: price - 0.5,
          close: price,
          volume: 1000,
        });
      }

      const result = calculateRSI(candles, 14);
      const lastRSI = result[result.length - 1];

      expect(lastRSI.value).toBeGreaterThan(30);
      expect(lastRSI.value).toBeLessThan(70);
    });
  });

  describe('generateRSISignal', () => {
    it('should generate buy signal when RSI crosses above oversold', () => {
      const rsiResults = [
        { timestamp: 1, value: 25 },
        { timestamp: 2, value: 28 },
        { timestamp: 3, value: 32 },
      ];

      const signals = generateRSISignal(rsiResults, 70, 30);
      const lastSignal = signals[signals.length - 1];

      expect(lastSignal.signal).toBe(1);
    });

    it('should generate sell signal when RSI crosses below overbought', () => {
      const rsiResults = [
        { timestamp: 1, value: 75 },
        { timestamp: 2, value: 72 },
        { timestamp: 3, value: 68 },
      ];

      const signals = generateRSISignal(rsiResults, 70, 30);
      const lastSignal = signals[signals.length - 1];

      expect(lastSignal.signal).toBe(-1);
    });

    it('should return 0 signal for neutral RSI', () => {
      const rsiResults = [
        { timestamp: 1, value: 50 },
        { timestamp: 2, value: 52 },
        { timestamp: 3, value: 48 },
      ];

      const signals = generateRSISignal(rsiResults, 70, 30);
      const lastSignal = signals[signals.length - 1];

      expect(lastSignal.signal).toBe(0);
    });
  });
});
