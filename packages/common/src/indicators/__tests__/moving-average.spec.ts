import { calculateSMA, calculateEMA, detectMACrossover } from '../moving-average';
import { OHLCV, IndicatorResult } from '../types';

describe('Moving Average Indicators', () => {
  const generateCandles = (prices: number[]): OHLCV[] => {
    return prices.map((price, i) => ({
      timestamp: Date.now() + i * 60000,
      open: price,
      high: price + 1,
      low: price - 1,
      close: price,
      volume: 1000,
    }));
  };

  describe('calculateSMA', () => {
    it('should return empty array for insufficient data', () => {
      const candles = generateCandles([100, 101, 102]);
      const result = calculateSMA(candles, 5);
      expect(result).toHaveLength(0);
    });

    it('should calculate SMA correctly', () => {
      const prices = [10, 20, 30, 40, 50];
      const candles = generateCandles(prices);
      const result = calculateSMA(candles, 5);

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(30); // (10+20+30+40+50)/5
    });

    it('should calculate rolling SMA', () => {
      const prices = [10, 20, 30, 40, 50, 60];
      const candles = generateCandles(prices);
      const result = calculateSMA(candles, 5);

      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(30); // (10+20+30+40+50)/5
      expect(result[1].value).toBe(40); // (20+30+40+50+60)/5
    });
  });

  describe('calculateEMA', () => {
    it('should return empty array for insufficient data', () => {
      const candles = generateCandles([100, 101, 102]);
      const result = calculateEMA(candles, 5);
      expect(result).toHaveLength(0);
    });

    it('should calculate EMA with more weight on recent prices', () => {
      const prices = [10, 10, 10, 10, 10, 20];
      const candles = generateCandles(prices);

      const smaResult = calculateSMA(candles, 5);
      const emaResult = calculateEMA(candles, 5);

      // EMA should be closer to recent price than SMA
      const lastPrice = prices[prices.length - 1];
      const emaDiff = Math.abs(emaResult[emaResult.length - 1].value - lastPrice);
      const smaDiff = Math.abs(smaResult[smaResult.length - 1].value - lastPrice);

      expect(emaDiff).toBeLessThan(smaDiff);
    });
  });

  describe('detectMACrossover', () => {
    it('should detect golden cross (bullish)', () => {
      const shortMA: IndicatorResult[] = [
        { timestamp: 1, value: 95 },
        { timestamp: 2, value: 98 },
        { timestamp: 3, value: 102 },
      ];

      const longMA: IndicatorResult[] = [
        { timestamp: 1, value: 100 },
        { timestamp: 2, value: 100 },
        { timestamp: 3, value: 100 },
      ];

      const signals = detectMACrossover(shortMA, longMA);
      const lastSignal = signals[signals.length - 1];

      expect(lastSignal.signal).toBe(1);
    });

    it('should detect dead cross (bearish)', () => {
      const shortMA: IndicatorResult[] = [
        { timestamp: 1, value: 105 },
        { timestamp: 2, value: 102 },
        { timestamp: 3, value: 98 },
      ];

      const longMA: IndicatorResult[] = [
        { timestamp: 1, value: 100 },
        { timestamp: 2, value: 100 },
        { timestamp: 3, value: 100 },
      ];

      const signals = detectMACrossover(shortMA, longMA);
      const lastSignal = signals[signals.length - 1];

      expect(lastSignal.signal).toBe(-1);
    });

    it('should return 0 when no crossover', () => {
      const shortMA: IndicatorResult[] = [
        { timestamp: 1, value: 105 },
        { timestamp: 2, value: 106 },
        { timestamp: 3, value: 107 },
      ];

      const longMA: IndicatorResult[] = [
        { timestamp: 1, value: 100 },
        { timestamp: 2, value: 100 },
        { timestamp: 3, value: 100 },
      ];

      const signals = detectMACrossover(shortMA, longMA);
      const lastSignal = signals[signals.length - 1];

      expect(lastSignal.signal).toBe(0);
    });
  });
});
