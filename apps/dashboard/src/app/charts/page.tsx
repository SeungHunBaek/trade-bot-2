'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { CandlestickChart } from '@/components/charts/candlestick-chart';
import { Time } from 'lightweight-charts';

// Mock data generator
function generateMockCandles(days: number = 30) {
  const candles = [];
  let basePrice = 87000000; // BTC/KRW
  const now = new Date();

  for (let i = days * 24 * 12; i >= 0; i--) {
    const time = Math.floor((now.getTime() - i * 5 * 60 * 1000) / 1000) as Time;
    const open = basePrice + (Math.random() - 0.5) * 500000;
    const close = open + (Math.random() - 0.5) * 500000;
    const high = Math.max(open, close) + Math.random() * 200000;
    const low = Math.min(open, close) - Math.random() * 200000;

    candles.push({ time, open, high, low, close });
    basePrice = close;
  }

  return candles;
}

// Mock order markers
function generateMockMarkers(candles: { time: Time; open: number; high: number; low: number; close: number }[]) {
  const markers: {
    time: Time;
    position: 'aboveBar' | 'belowBar';
    color: string;
    shape: 'circle' | 'square' | 'arrowUp' | 'arrowDown';
    text: string;
  }[] = [];
  const orderCount = 20;

  for (let i = 0; i < orderCount; i++) {
    const idx = Math.floor(Math.random() * candles.length);
    const isBuy = Math.random() > 0.5;

    markers.push({
      time: candles[idx].time,
      position: isBuy ? 'belowBar' : 'aboveBar',
      color: isBuy ? '#22c55e' : '#ef4444',
      shape: isBuy ? 'arrowUp' : 'arrowDown',
      text: isBuy ? 'BUY' : 'SELL',
    });
  }

  return markers.sort((a, b) => (a.time as number) - (b.time as number));
}

const symbols = [
  { value: 'BTC/KRW', label: 'BTC/KRW' },
  { value: 'ETH/KRW', label: 'ETH/KRW' },
  { value: 'XRP/KRW', label: 'XRP/KRW' },
  { value: 'SOL/KRW', label: 'SOL/KRW' },
];

const timeframes = [
  { value: '1m', label: '1분' },
  { value: '5m', label: '5분' },
  { value: '15m', label: '15분' },
  { value: '1h', label: '1시간' },
  { value: '4h', label: '4시간' },
  { value: '1d', label: '1일' },
];

export default function ChartsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/KRW');
  const [selectedTimeframe, setSelectedTimeframe] = useState('5m');
  const [crosshairData, setCrosshairData] = useState<{
    price: number | null;
    time: Time | null;
  }>({ price: null, time: null });

  const candles = useMemo(() => generateMockCandles(), [selectedSymbol, selectedTimeframe]);
  const markers = useMemo(() => generateMockMarkers(candles), [candles]);

  const lastCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];
  const priceChange = lastCandle.close - prevCandle.close;
  const priceChangePercent = (priceChange / prevCandle.close) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Charts</h1>
        <div className="flex items-center gap-4">
          <Select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="w-32"
          >
            {symbols.map((symbol) => (
              <option key={symbol.value} value={symbol.value}>
                {symbol.label}
              </option>
            ))}
          </Select>
          <Select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="w-24"
          >
            {timeframes.map((tf) => (
              <option key={tf.value} value={tf.value}>
                {tf.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Price Header */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-sm text-muted-foreground">{selectedSymbol}</div>
              <div className="text-3xl font-bold">
                {crosshairData.price?.toLocaleString() ?? lastCandle.close.toLocaleString()}
              </div>
            </div>
            <div className={`text-lg font-medium ${priceChange >= 0 ? 'text-success' : 'text-destructive'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toLocaleString()}
              <span className="ml-2 text-sm">
                ({priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="h-[600px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {selectedSymbol} - {timeframes.find((tf) => tf.value === selectedTimeframe)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-60px)]">
          <CandlestickChart
            data={candles}
            markers={markers}
            onCrosshairMove={(price, time) => setCrosshairData({ price, time })}
          />
        </CardContent>
      </Card>

      {/* Order Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-success">Recent Buy Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {markers
                .filter((m) => m.text === 'BUY')
                .slice(-5)
                .reverse()
                .map((marker, idx) => {
                  const candle = candles.find((c) => c.time === marker.time);
                  return (
                    <div key={idx} className="flex justify-between text-sm border-b border-border pb-2 last:border-0">
                      <span className="text-muted-foreground">
                        {new Date((marker.time as number) * 1000).toLocaleString('ko-KR')}
                      </span>
                      <span>{candle?.close.toLocaleString()}</span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-destructive">Recent Sell Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {markers
                .filter((m) => m.text === 'SELL')
                .slice(-5)
                .reverse()
                .map((marker, idx) => {
                  const candle = candles.find((c) => c.time === marker.time);
                  return (
                    <div key={idx} className="flex justify-between text-sm border-b border-border pb-2 last:border-0">
                      <span className="text-muted-foreground">
                        {new Date((marker.time as number) * 1000).toLocaleString('ko-KR')}
                      </span>
                      <span>{candle?.close.toLocaleString()}</span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
