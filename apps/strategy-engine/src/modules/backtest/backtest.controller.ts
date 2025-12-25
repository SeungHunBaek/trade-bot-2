import { Controller, Post, Body } from '@nestjs/common';

import { BacktestService, BacktestConfig, BacktestResult } from './backtest.service';

@Controller('backtest')
export class BacktestController {
  constructor(private readonly backtestService: BacktestService) {}

  @Post('run')
  async runBacktest(
    @Body() body: {
      exchange: string;
      symbol: string;
      timeframe: string;
      startDate: string;
      endDate: string;
      initialCapital: number;
      strategyType: 'rsi' | 'macd' | 'ma_crossover';
      params: Record<string, unknown>;
      feeRate?: number;
      slippage?: number;
    },
  ): Promise<BacktestResult> {
    const config: BacktestConfig = {
      exchange: body.exchange,
      symbol: body.symbol,
      timeframe: body.timeframe,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      initialCapital: body.initialCapital,
      strategyType: body.strategyType,
      params: body.params,
      feeRate: body.feeRate,
      slippage: body.slippage,
    };

    return this.backtestService.runBacktest(config);
  }
}
