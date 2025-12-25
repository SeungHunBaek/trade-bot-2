import { calculateBollingerBands, generateBollingerSignal } from '../bollinger';
import { OHLCV } from '../types';

describe('Bollinger Bands Indicator', () => {
  // 변동성 있는 캔들 생성
  const generateVolatileCandles = (count: number, basePrice: number = 100): OHLCV[] => {
    return Array.from({ length: count }, (_, i) => {
      const change = (i % 2 === 0 ? 5 : -5);
      return {
        timestamp: Date.now() + i * 60000,
        open: basePrice,
        high: basePrice + 5,
        low: basePrice - 5,
        close: basePrice + change,
        volume: 1000,
      };
    });
  };

  describe('calculateBollingerBands', () => {
    it('should return empty array for insufficient data', () => {
      const candles = generateVolatileCandles(10);
      const result = calculateBollingerBands(candles, 20);
      expect(result).toHaveLength(0);
    });

    it('should calculate Bollinger Bands correctly with volatility', () => {
      const candles = generateVolatileCandles(25);
      const result = calculateBollingerBands(candles, 20, 2);

      expect(result.length).toBeGreaterThan(0);

      const lastBand = result[result.length - 1];
      expect(lastBand.middle).toBeCloseTo(100, 0);
      expect(lastBand.upper).toBeGreaterThan(lastBand.middle);
      expect(lastBand.lower).toBeLessThan(lastBand.middle);
    });

    it('should have symmetric bands around middle', () => {
      const candles = generateVolatileCandles(25);
      const result = calculateBollingerBands(candles, 20, 2);

      result.forEach((band) => {
        const upperDiff = band.upper - band.middle;
        const lowerDiff = band.middle - band.lower;
        expect(upperDiff).toBeCloseTo(lowerDiff, 5);
      });
    });

    it('should expand bands with increased volatility', () => {
      const candles: OHLCV[] = [];
      for (let i = 0; i < 30; i++) {
        const volatility = i < 15 ? 1 : 10;
        const change = (i % 2 === 0 ? 1 : -1) * volatility;
        candles.push({
          timestamp: Date.now() + i * 60000,
          open: 100,
          high: 100 + Math.abs(change),
          low: 100 - Math.abs(change),
          close: 100 + change,
          volume: 1000,
        });
      }

      const result = calculateBollingerBands(candles, 10, 2);
      const earlyBand = result[5];
      const lateBand = result[result.length - 1];

      const earlyWidth = earlyBand.upper - earlyBand.lower;
      const lateWidth = lateBand.upper - lateBand.lower;

      expect(lateWidth).toBeGreaterThan(earlyWidth);
    });
  });

  describe('generateBollingerSignal', () => {
    it('should generate buy signal when price bounces from lower band', () => {
      // 하단 밴드 아래에서 올라올 때 매수 시그널
      const candles: OHLCV[] = [];
      for (let i = 0; i < 25; i++) {
        const change = (i % 2 === 0 ? 5 : -5);
        candles.push({
          timestamp: i,
          open: 100,
          high: 105,
          low: 95,
          close: 100 + change,
          volume: 1000,
        });
      }

      // 마지막에서 두번째 캔들: 하단 밴드 아래
      candles[23].close = 85;
      // 마지막 캔들: 하단 밴드 위로 복귀
      candles[24].close = 98;

      const bands = calculateBollingerBands(candles, 20, 2);
      const signals = generateBollingerSignal(candles, bands);
      const lastSignal = signals[signals.length - 1];

      expect(lastSignal.signal).toBe(1);
    });

    it('should generate sell signal when price drops from upper band', () => {
      // 상단 밴드 위에서 내려올 때 매도 시그널
      const candles: OHLCV[] = [];
      for (let i = 0; i < 25; i++) {
        const change = (i % 2 === 0 ? 5 : -5);
        candles.push({
          timestamp: i,
          open: 100,
          high: 105,
          low: 95,
          close: 100 + change,
          volume: 1000,
        });
      }

      // 마지막에서 두번째 캔들: 상단 밴드 위
      candles[23].close = 115;
      // 마지막 캔들: 상단 밴드 아래로 하락
      candles[24].close = 102;

      const bands = calculateBollingerBands(candles, 20, 2);
      const signals = generateBollingerSignal(candles, bands);
      const lastSignal = signals[signals.length - 1];

      expect(lastSignal.signal).toBe(-1);
    });

    it('should return 0 when price stays within bands', () => {
      const candles = generateVolatileCandles(25, 100);
      const bands = calculateBollingerBands(candles, 20, 2);
      const signals = generateBollingerSignal(candles, bands);

      // 정상적인 변동 범위 내에서는 0 시그널
      const lastSignal = signals[signals.length - 1];
      expect(lastSignal.signal).toBe(0);
    });
  });
});
