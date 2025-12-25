import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';

import {
  OrderEntity,
  OrderFillEntity,
  AccountEntity,
  ApiCredentialEntity,
} from '@passive-money/database';
import {
  ExchangeId,
  OrderSide,
  OrderType,
  OrderStatus,
} from '@passive-money/common';

import { OrderService } from '../src/modules/order/order.service';
import { RiskService } from '../src/modules/risk/risk.service';

describe('OrderService', () => {
  let service: OrderService;

  const mockOrderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockOrderFillRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockAccountRepository = {
    findOne: jest.fn(),
  };

  const mockApiCredentialRepository = {
    findOne: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  const mockRiskService = {
    validateOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderFillEntity),
          useValue: mockOrderFillRepository,
        },
        {
          provide: getRepositoryToken(AccountEntity),
          useValue: mockAccountRepository,
        },
        {
          provide: getRepositoryToken(ApiCredentialEntity),
          useValue: mockApiCredentialRepository,
        },
        {
          provide: getQueueToken('order-queue'),
          useValue: mockQueue,
        },
        {
          provide: RiskService,
          useValue: mockRiskService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create and queue an order', async () => {
      const dto = {
        accountId: 'account-1',
        exchange: ExchangeId.BITHUMB,
        symbol: 'BTC/KRW',
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        amount: 0.01,
        price: 50000000,
      };

      const mockOrder = {
        id: 'order-1',
        ...dto,
        status: OrderStatus.NEW,
      };

      mockRiskService.validateOrder.mockResolvedValue({ passed: true });
      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockQueue.add.mockResolvedValue({});

      const result = await service.createOrder(dto);

      expect(result).toEqual(mockOrder);
      expect(mockRiskService.validateOrder).toHaveBeenCalled();
      expect(mockOrderRepository.create).toHaveBeenCalled();
      expect(mockOrderRepository.save).toHaveBeenCalled();
      expect(mockQueue.add).toHaveBeenCalledWith(
        'execute-order',
        { orderId: 'order-1' },
        expect.any(Object),
      );
    });

    it('should throw error when risk check fails', async () => {
      const dto = {
        accountId: 'account-1',
        exchange: ExchangeId.BITHUMB,
        symbol: 'BTC/KRW',
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        amount: 100,
        price: 50000000,
      };

      mockRiskService.validateOrder.mockResolvedValue({
        passed: false,
        reason: 'Order size exceeds limit',
      });

      await expect(service.createOrder(dto)).rejects.toThrow(
        'Risk check failed: Order size exceeds limit',
      );
    });
  });

  describe('getOrder', () => {
    it('should return order with fills', async () => {
      const mockOrder = {
        id: 'order-1',
        status: OrderStatus.FILLED,
        fills: [{ id: 'fill-1' }],
      };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.getOrder('order-1');

      expect(result).toEqual(mockOrder);
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        relations: ['fills'],
      });
    });

    it('should return null for non-existent order', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      const result = await service.getOrder('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getOpenOrders', () => {
    it('should return open orders', async () => {
      const mockOrders = [
        { id: 'order-1', status: OrderStatus.OPEN },
        { id: 'order-2', status: OrderStatus.NEW },
      ];

      mockOrderRepository.find.mockResolvedValue(mockOrders);

      const result = await service.getOpenOrders('account-1');

      expect(result).toEqual(mockOrders);
    });
  });

  describe('cancelOrder', () => {
    it('should queue order cancellation', async () => {
      const mockOrder = {
        id: 'order-1',
        status: OrderStatus.OPEN,
        externalOrderId: 'ex-order-1',
      };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockQueue.add.mockResolvedValue({});

      await service.cancelOrder('order-1');

      expect(mockQueue.add).toHaveBeenCalledWith(
        'cancel-order',
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('should throw error for already filled order', async () => {
      const mockOrder = {
        id: 'order-1',
        status: OrderStatus.FILLED,
      };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      await expect(service.cancelOrder('order-1')).rejects.toThrow(
        'Cannot cancel order with status: filled',
      );
    });
  });

  describe('addOrderFill', () => {
    it('should add fill and update order', async () => {
      const mockOrder = {
        id: 'order-1',
        exchange: ExchangeId.BITHUMB,
        symbol: 'BTC/KRW',
        side: OrderSide.BUY,
        amount: 1,
        status: OrderStatus.OPEN,
      };

      const fill = {
        externalFillId: 'trade-1',
        price: 50000000,
        amount: 0.5,
        fee: 1000,
        feeCurrency: 'KRW',
      };

      const mockFill = {
        id: 'fill-1',
        ...fill,
        orderId: 'order-1',
      };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderFillRepository.create.mockReturnValue(mockFill);
      mockOrderFillRepository.save.mockResolvedValue(mockFill);
      mockOrderFillRepository.find.mockResolvedValue([mockFill]);
      mockOrderRepository.save.mockResolvedValue({
        ...mockOrder,
        filled: 0.5,
        remaining: 0.5,
        status: OrderStatus.PARTIAL,
      });

      const result = await service.addOrderFill('order-1', fill);

      expect(result).toEqual(mockFill);
    });
  });
});
