import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PositionEntity, OrderEntity } from '@passive-money/database';
import {
  OrderSide,
  OrderStatus,
  ExchangeId,
  TradingMode,
} from '@passive-money/common';

export interface PositionSummary {
  symbol: string;
  exchange: ExchangeId;
  side: OrderSide;
  amount: number;
  entryPrice: number;
  currentPrice?: number;
  unrealizedPnl?: number;
  unrealizedPnlPercent?: number;
  realizedPnl: number;
}

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async getPosition(
    accountId: string,
    exchange: ExchangeId,
    symbol: string,
  ): Promise<PositionEntity | null> {
    return this.positionRepository.findOne({
      where: {
        accountId,
        exchange,
        symbol,
      },
    });
  }

  async getPositions(accountId: string): Promise<PositionEntity[]> {
    return this.positionRepository.find({
      where: { accountId },
      order: { updatedAt: 'DESC' },
    });
  }

  async getOpenPositions(accountId: string): Promise<PositionEntity[]> {
    return this.positionRepository.find({
      where: { accountId, isOpen: true },
    });
  }

  async updatePositionFromFill(
    accountId: string,
    exchange: ExchangeId,
    symbol: string,
    side: OrderSide,
    fillAmount: number,
    price: number,
    fee: number,
    mode: TradingMode = TradingMode.LIVE,
  ): Promise<PositionEntity> {
    let position = await this.getPosition(accountId, exchange, symbol);

    if (!position) {
      position = this.positionRepository.create({
        accountId,
        exchange,
        symbol,
        side: side,
        mode: mode,
        amount: 0,
        entryPrice: 0,
        realizedPnl: 0,
        isOpen: true,
        openedAt: new Date(),
      });
    }

    // 스팟 거래에서의 포지션 계산 (long only)
    if (side === OrderSide.BUY) {
      // 매수: 포지션 증가
      const totalCost = position.entryPrice * position.amount + price * fillAmount;
      const newAmount = position.amount + fillAmount;
      position.entryPrice = newAmount > 0 ? totalCost / newAmount : 0;
      position.amount = newAmount;
      position.side = OrderSide.BUY;
      position.isOpen = true;
    } else {
      // 매도: 포지션 감소, 실현 손익 계산
      if (position.amount > 0) {
        const sellAmount = Math.min(fillAmount, position.amount);
        const pnl = (price - position.entryPrice) * sellAmount - fee;
        position.realizedPnl += pnl;
        position.amount -= sellAmount;

        if (position.amount <= 0) {
          position.amount = 0;
          position.isOpen = false;
          position.closedAt = new Date();
        }
      }
    }

    return this.positionRepository.save(position);
  }

  async calculateUnrealizedPnl(
    position: PositionEntity,
    currentPrice: number,
  ): Promise<{
    unrealizedPnl: number;
    unrealizedPnlPercent: number;
  }> {
    if (position.amount <= 0 || position.entryPrice <= 0) {
      return { unrealizedPnl: 0, unrealizedPnlPercent: 0 };
    }

    const unrealizedPnl = (currentPrice - position.entryPrice) * position.amount;
    const unrealizedPnlPercent =
      ((currentPrice - position.entryPrice) / position.entryPrice) * 100;

    return { unrealizedPnl, unrealizedPnlPercent };
  }

  async getPositionSummary(
    accountId: string,
    exchange: ExchangeId,
    symbol: string,
    currentPrice?: number,
  ): Promise<PositionSummary | null> {
    const position = await this.getPosition(accountId, exchange, symbol);

    if (!position) {
      return null;
    }

    const summary: PositionSummary = {
      symbol: position.symbol,
      exchange: position.exchange as ExchangeId,
      side: position.side,
      amount: position.amount,
      entryPrice: position.entryPrice,
      realizedPnl: position.realizedPnl,
    };

    if (currentPrice !== undefined && position.amount > 0) {
      const { unrealizedPnl, unrealizedPnlPercent } =
        await this.calculateUnrealizedPnl(position, currentPrice);
      summary.currentPrice = currentPrice;
      summary.unrealizedPnl = unrealizedPnl;
      summary.unrealizedPnlPercent = unrealizedPnlPercent;
    }

    return summary;
  }

  async recalculatePositionFromOrders(
    accountId: string,
    exchange: ExchangeId,
    symbol: string,
  ): Promise<PositionEntity> {
    // 모든 체결된 주문 조회
    const orders = await this.orderRepository.find({
      where: {
        accountId,
        exchange,
        symbol,
        status: OrderStatus.FILLED,
      },
      relations: ['fills'],
      order: { createdAt: 'ASC' },
    });

    // 포지션 초기화
    let position = await this.getPosition(accountId, exchange, symbol);

    if (!position) {
      position = this.positionRepository.create({
        accountId,
        exchange,
        symbol,
        side: OrderSide.BUY,
        mode: TradingMode.LIVE,
        amount: 0,
        entryPrice: 0,
        realizedPnl: 0,
        isOpen: false,
      });
    } else {
      position.amount = 0;
      position.entryPrice = 0;
      position.realizedPnl = 0;
      position.isOpen = false;
    }

    // 모든 체결 내역으로 포지션 재계산
    for (const order of orders) {
      for (const fill of order.fills || []) {
        const fee = fill.fee || 0;

        if (order.side === OrderSide.BUY) {
          const totalCost =
            position.entryPrice * position.amount + fill.price * fill.amount;
          const newAmount = position.amount + fill.amount;
          position.entryPrice = newAmount > 0 ? totalCost / newAmount : 0;
          position.amount = newAmount;
          position.side = OrderSide.BUY;
          position.isOpen = true;
        } else {
          if (position.amount > 0) {
            const sellAmount = Math.min(fill.amount, position.amount);
            const pnl = (fill.price - position.entryPrice) * sellAmount - fee;
            position.realizedPnl += pnl;
            position.amount -= sellAmount;

            if (position.amount <= 0) {
              position.amount = 0;
              position.isOpen = false;
            }
          }
        }
      }
    }

    return this.positionRepository.save(position);
  }

  async closePosition(
    accountId: string,
    exchange: ExchangeId,
    symbol: string,
  ): Promise<void> {
    const position = await this.getPosition(accountId, exchange, symbol);

    if (position) {
      position.amount = 0;
      position.isOpen = false;
      position.closedAt = new Date();
      await this.positionRepository.save(position);
    }
  }
}
