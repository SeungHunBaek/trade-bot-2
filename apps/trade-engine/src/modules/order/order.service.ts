import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';

import {
  OrderEntity,
  OrderFillEntity,
  AccountEntity,
  ApiCredentialEntity,
} from '@passive-money/database';
import { OrderStatus, TradingMode } from '@passive-money/common';

import { RiskService } from '../risk/risk.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderFillEntity)
    private readonly orderFillRepository: Repository<OrderFillEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(ApiCredentialEntity)
    private readonly apiCredentialRepository: Repository<ApiCredentialEntity>,
    @InjectQueue('order-queue')
    private readonly orderQueue: Queue,
    private readonly riskService: RiskService,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<OrderEntity> {
    // 리스크 검증
    const riskCheck = await this.riskService.validateOrder({
      accountId: dto.accountId,
      symbol: dto.symbol,
      side: dto.side,
      amount: dto.amount,
      price: dto.price,
    });

    if (!riskCheck.passed) {
      throw new BadRequestException(`Risk check failed: ${riskCheck.reason}`);
    }

    // 주문 엔티티 생성
    const order = this.orderRepository.create({
      accountId: dto.accountId,
      strategyInstanceId: dto.strategyInstanceId,
      exchange: dto.exchange,
      symbol: dto.symbol,
      side: dto.side,
      type: dto.type,
      mode: dto.mode || TradingMode.LIVE,
      amount: dto.amount,
      price: dto.price || 0,
      remaining: dto.amount,
      status: OrderStatus.NEW,
    });

    const savedOrder = await this.orderRepository.save(order);

    // 주문 처리 큐에 추가
    await this.orderQueue.add(
      'execute-order',
      {
        orderId: savedOrder.id,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );

    this.logger.log(`Order created and queued: ${savedOrder.id}`);

    return savedOrder;
  }

  async getOrder(orderId: string): Promise<OrderEntity | null> {
    return this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['fills'],
    });
  }

  async getOrdersByAccount(
    accountId: string,
    status?: OrderStatus,
  ): Promise<OrderEntity[]> {
    const where: Record<string, unknown> = { accountId };
    if (status) {
      where.status = status;
    }

    return this.orderRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async getOpenOrders(accountId: string): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: [
        { accountId, status: OrderStatus.NEW },
        { accountId, status: OrderStatus.OPEN },
        { accountId, status: OrderStatus.PARTIAL },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async cancelOrder(orderId: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (
      order.status === OrderStatus.FILLED ||
      order.status === OrderStatus.CANCELED
    ) {
      throw new BadRequestException(
        `Cannot cancel order with status: ${order.status}`,
      );
    }

    // 취소 작업을 큐에 추가
    await this.orderQueue.add(
      'cancel-order',
      {
        orderId: order.id,
        externalOrderId: order.externalOrderId,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );

    this.logger.log(`Order cancellation queued: ${orderId}`);

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    externalOrderId?: string,
    filledAmount?: number,
  ): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    order.status = status;

    if (externalOrderId) {
      order.externalOrderId = externalOrderId;
    }

    if (filledAmount !== undefined) {
      order.filled = filledAmount;
      order.remaining = order.amount - filledAmount;
    }

    return this.orderRepository.save(order);
  }

  async addOrderFill(
    orderId: string,
    fill: {
      externalFillId: string;
      price: number;
      amount: number;
      fee: number;
      feeCurrency: string;
    },
  ): Promise<OrderFillEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const orderFill = this.orderFillRepository.create({
      orderId: order.id,
      externalFillId: fill.externalFillId,
      exchange: order.exchange,
      symbol: order.symbol,
      side: order.side,
      price: fill.price,
      amount: fill.amount,
      fee: fill.fee,
      feeCurrency: fill.feeCurrency,
      timestamp: Date.now(),
    });

    const savedFill = await this.orderFillRepository.save(orderFill);

    // 주문의 filled 정보 업데이트
    const fills = await this.orderFillRepository.find({
      where: { orderId: order.id },
    });

    const totalFilled = fills.reduce((sum, f) => sum + f.amount, 0);
    const totalFee = fills.reduce((sum, f) => sum + (f.fee || 0), 0);

    order.filled = totalFilled;
    order.remaining = order.amount - totalFilled;
    order.fee = totalFee;

    // 상태 업데이트
    if (totalFilled >= order.amount) {
      order.status = OrderStatus.FILLED;
      order.filledAt = new Date();
    } else if (totalFilled > 0) {
      order.status = OrderStatus.PARTIAL;
    }

    await this.orderRepository.save(order);

    return savedFill;
  }

  async getApiCredentials(
    accountId: string,
  ): Promise<ApiCredentialEntity | null> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      return null;
    }

    // ApiCredentialEntity는 accountId당 하나이므로 exchange 필터링 제거
    return this.apiCredentialRepository.findOne({
      where: {
        accountId,
        isValid: true,
      },
    });
  }
}
