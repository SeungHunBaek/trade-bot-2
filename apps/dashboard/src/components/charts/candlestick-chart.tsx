'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  Time,
} from 'lightweight-charts';

interface CandlestickChartProps {
  data: CandlestickData<Time>[];
  markers?: {
    time: Time;
    position: 'aboveBar' | 'belowBar';
    color: string;
    shape: 'circle' | 'square' | 'arrowUp' | 'arrowDown';
    text: string;
  }[];
  onCrosshairMove?: (price: number | null, time: Time | null) => void;
}

export function CandlestickChart({ data, markers, onCrosshairMove }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'hsl(215, 20.2%, 65.1%)',
      },
      grid: {
        vertLines: { color: 'hsl(217.2, 32.6%, 17.5%)' },
        horzLines: { color: 'hsl(217.2, 32.6%, 17.5%)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'hsl(217.2, 32.6%, 17.5%)',
      },
      timeScale: {
        borderColor: 'hsl(217.2, 32.6%, 17.5%)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        vertTouchDrag: false,
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    seriesRef.current = candlestickSeries;

    if (data.length > 0) {
      candlestickSeries.setData(data);
    }

    if (markers && markers.length > 0) {
      candlestickSeries.setMarkers(markers);
    }

    chart.timeScale().fitContent();

    if (onCrosshairMove) {
      chart.subscribeCrosshairMove((param) => {
        if (!param.time || !param.seriesData.size) {
          onCrosshairMove(null, null);
          return;
        }
        const data = param.seriesData.get(candlestickSeries) as CandlestickData<Time> | undefined;
        if (data) {
          onCrosshairMove(data.close, param.time);
        }
      });
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data);
      if (markers && markers.length > 0) {
        seriesRef.current.setMarkers(markers);
      }
      chartRef.current?.timeScale().fitContent();
    }
  }, [data, markers]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full min-h-[400px]"
    />
  );
}
