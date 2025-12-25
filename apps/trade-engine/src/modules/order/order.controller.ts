import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';

import { OrderStatus } from '@passive-money/common';

import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(dto);
  }

  @Get(':orderId')
  async getOrder(@Param('orderId') orderId: string) {
    return this.orderService.getOrder(orderId);
  }

  @Get('account/:accountId')
  async getOrdersByAccount(
    @Param('accountId') accountId: string,
    @Query('status') status?: OrderStatus,
  ) {
    return this.orderService.getOrdersByAccount(accountId, status);
  }

  @Get('account/:accountId/open')
  async getOpenOrders(@Param('accountId') accountId: string) {
    return this.orderService.getOpenOrders(accountId);
  }

  @Delete(':orderId')
  async cancelOrder(@Param('orderId') orderId: string) {
    return this.orderService.cancelOrder(orderId);
  }
}
