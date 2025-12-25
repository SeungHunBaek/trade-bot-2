import { Controller, Get, Post, Query, Param, Body } from '@nestjs/common';

import { ExchangeId, Timeframe } from '@passive-money/common';

import { CandleService } from './candle.service';
import { CandleScheduler } from './candle.scheduler';

@Controller('candles')
export class CandleController {
  constructor(
    private readonly candleService: CandleService,
    private readonly candleScheduler: CandleScheduler,
  ) {}

  @Get('symbols')
  async getAvailableSymbols(): Promise<{ symbols: string[] }> {
    const symbols = await this.candleService.getAvailableSymbols();
    return { symbols };
  }

  @Get('collecting-symbols')
  getCollectingSymbols(): { symbols: string[] } {
    return { symbols: this.candleScheduler.getSymbols() };
  }

  @Post('symbols/:symbol')
  addSymbol(@Param('symbol') symbol: string): { message: string } {
    // URL에서 _ 를 / 로 변환 (BTC_KRW -> BTC/KRW)
    const formattedSymbol = symbol.replace('_', '/');
    this.candleScheduler.addSymbol(formattedSymbol);
    return { message: `심볼 ${formattedSymbol} 추가됨` };
  }

  @Get(':exchange/:symbol/:timeframe')
  async getCandles(
    @Param('exchange') exchange: ExchangeId,
    @Param('symbol') symbol: string,
    @Param('timeframe') timeframe: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    // URL에서 _ 를 / 로 변환
    const formattedSymbol = symbol.replace('_', '/');

    const candles = await this.candleService.getCandles(
      exchange,
      formattedSymbol,
      timeframe,
      from ? parseInt(from, 10) : undefined,
      to ? parseInt(to, 10) : undefined,
      limit ? parseInt(limit, 10) : 1000,
    );

    return {
      exchange,
      symbol: formattedSymbol,
      timeframe,
      count: candles.length,
      candles,
    };
  }

  @Get(':exchange/:symbol/:timeframe/latest')
  async getLatestCandle(
    @Param('exchange') exchange: ExchangeId,
    @Param('symbol') symbol: string,
    @Param('timeframe') timeframe: string,
  ) {
    const formattedSymbol = symbol.replace('_', '/');

    const candle = await this.candleService.getLatestCandle(
      exchange,
      formattedSymbol,
      timeframe,
    );

    return { candle };
  }

  @Get(':exchange/:symbol/:timeframe/count')
  async getCandleCount(
    @Param('exchange') exchange: ExchangeId,
    @Param('symbol') symbol: string,
    @Param('timeframe') timeframe: string,
  ) {
    const formattedSymbol = symbol.replace('_', '/');

    const count = await this.candleService.getCandleCount(
      exchange,
      formattedSymbol,
      timeframe,
    );

    return {
      exchange,
      symbol: formattedSymbol,
      timeframe,
      count,
    };
  }

  @Post('fetch')
  async fetchCandles(
    @Body() body: { symbol: string; timeframe: Timeframe; limit?: number },
  ) {
    const { symbol, timeframe, limit = 200 } = body;
    const formattedSymbol = symbol.replace('_', '/');

    const savedCount = await this.candleService.fetchAndSaveCandles(
      formattedSymbol,
      timeframe,
      undefined,
      limit,
    );

    return {
      symbol: formattedSymbol,
      timeframe,
      savedCount,
    };
  }
}
