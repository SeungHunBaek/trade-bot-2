import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { OrderStatus, ExchangeId, OrderRequest } from '@passive-money/common';
import { BithumbExchange } from '@passive-money/exchange';

import { OrderService } from './order.service';

interface ExecuteOrderJob {
  orderId: string;
}

interface CancelOrderJob {
  orderId: string;
  externalOrderId?: string;
}

@Processor('order-queue')
export class OrderProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderProcessor.name);
  private exchanges: Map<string, BithumbExchange> = new Map();

  constructor(private readonly orderService: OrderService) {
    super();
  }

  async process(job: Job<ExecuteOrderJob | CancelOrderJob>): Promise<void> {
    this.logger.log(`Processing job ${job.name}: ${JSON.stringify(job.data)}`);

    switch (job.name) {
      case 'execute-order':
        await this.executeOrder(job.data as ExecuteOrderJob);
        break;
      case 'cancel-order':
        await this.cancelOrder(job.data as CancelOrderJob);
        break;
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async executeOrder(data: ExecuteOrderJob): Promise<void> {
    const order = await this.orderService.getOrder(data.orderId);

    if (!order) {
      this.logger.error(`Order not found: ${data.orderId}`);
      return;
    }

    try {
      // API 자격증명 조회
      const credentials = await this.orderService.getApiCredentials(
        order.accountId,
      );

      if (!credentials) {
        await this.orderService.updateOrderStatus(
          order.id,
          OrderStatus.REJECTED,
        );
        this.logger.error(`No API credentials for account: ${order.accountId}`);
        return;
      }

      // 거래소 인스턴스 생성
      const exchange = this.getOrCreateExchange(
        order.accountId,
        order.exchange as ExchangeId,
        credentials.accessKey,
        credentials.secretKey,
      );

      // 주문 상태 업데이트
      await this.orderService.updateOrderStatus(order.id, OrderStatus.OPEN);

      // 주문 요청 객체 생성
      const orderRequest: OrderRequest = {
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        amount: order.amount,
        price: order.price,
      };

      // 거래소에 주문 전송
      const exchangeOrder = await exchange.createOrder(orderRequest);

      // 주문 결과로 상태 업데이트
      await this.orderService.updateOrderStatus(
        order.id,
        this.mapOrderStatus(exchangeOrder.status),
        exchangeOrder.orderId,
        exchangeOrder.filled,
      );

      this.logger.log(
        `Order executed: ${order.id} -> ${exchangeOrder.orderId} (${exchangeOrder.status})`,
      );
    } catch (error) {
      this.logger.error(`Failed to execute order ${order.id}:`, error);
      await this.orderService.updateOrderStatus(order.id, OrderStatus.REJECTED);
      throw error;
    }
  }

  private async cancelOrder(data: CancelOrderJob): Promise<void> {
    const order = await this.orderService.getOrder(data.orderId);

    if (!order) {
      this.logger.error(`Order not found: ${data.orderId}`);
      return;
    }

    if (!order.externalOrderId) {
      // 거래소에 전송되지 않은 주문은 바로 취소
      await this.orderService.updateOrderStatus(order.id, OrderStatus.CANCELED);
      this.logger.log(`Order canceled (not submitted): ${order.id}`);
      return;
    }

    try {
      const credentials = await this.orderService.getApiCredentials(
        order.accountId,
      );

      if (!credentials) {
        this.logger.error(`No API credentials for account: ${order.accountId}`);
        return;
      }

      const exchange = this.getOrCreateExchange(
        order.accountId,
        order.exchange as ExchangeId,
        credentials.accessKey,
        credentials.secretKey,
      );

      await exchange.cancelOrder(order.externalOrderId, order.symbol);

      await this.orderService.updateOrderStatus(order.id, OrderStatus.CANCELED);

      this.logger.log(`Order canceled: ${order.id}`);
    } catch (error) {
      this.logger.error(`Failed to cancel order ${order.id}:`, error);
      throw error;
    }
  }

  private getOrCreateExchange(
    accountId: string,
    exchangeId: ExchangeId,
    accessKey: string,
    secretKey: string,
  ): BithumbExchange {
    const key = `${accountId}-${exchangeId}`;

    if (!this.exchanges.has(key)) {
      const exchange = new BithumbExchange({
        accessKey,
        secretKey,
      });
      this.exchanges.set(key, exchange);
    }

    return this.exchanges.get(key)!;
  }

  private mapOrderStatus(status: OrderStatus): OrderStatus {
    // 이미 OrderStatus enum이므로 그대로 반환
    return status;
  }
}
