import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

import {
  OrderSide,
  OrderType,
  ExchangeId,
  TradingMode,
} from '@passive-money/common';

export class CreateOrderDto {
  @IsUUID()
  accountId: string;

  @IsUUID()
  @IsOptional()
  strategyInstanceId?: string;

  @IsEnum(ExchangeId)
  exchange: ExchangeId;

  @IsString()
  symbol: string;

  @IsEnum(OrderSide)
  side: OrderSide;

  @IsEnum(OrderType)
  type: OrderType;

  @IsEnum(TradingMode)
  @IsOptional()
  mode?: TradingMode;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;
}
