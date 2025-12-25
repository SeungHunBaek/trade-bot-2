import { Controller, Get, Post, Param, Query } from '@nestjs/common';

import { ExchangeId } from '@passive-money/common';

import { PositionService } from './position.service';

@Controller('positions')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Get('account/:accountId')
  async getPositions(@Param('accountId') accountId: string) {
    return this.positionService.getPositions(accountId);
  }

  @Get('account/:accountId/open')
  async getOpenPositions(@Param('accountId') accountId: string) {
    return this.positionService.getOpenPositions(accountId);
  }

  @Get('account/:accountId/:exchange/:symbol')
  async getPosition(
    @Param('accountId') accountId: string,
    @Param('exchange') exchange: ExchangeId,
    @Param('symbol') symbol: string,
    @Query('currentPrice') currentPrice?: string,
  ) {
    if (currentPrice) {
      return this.positionService.getPositionSummary(
        accountId,
        exchange,
        symbol,
        parseFloat(currentPrice),
      );
    }
    return this.positionService.getPosition(accountId, exchange, symbol);
  }

  @Post('account/:accountId/:exchange/:symbol/recalculate')
  async recalculatePosition(
    @Param('accountId') accountId: string,
    @Param('exchange') exchange: ExchangeId,
    @Param('symbol') symbol: string,
  ) {
    return this.positionService.recalculatePositionFromOrders(
      accountId,
      exchange,
      symbol,
    );
  }
}
