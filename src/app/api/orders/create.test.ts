import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => {
  const transaction = {
    order: { create: vi.fn() },
    orderItem: { createMany: vi.fn() },
    orderStatusHistory: { create: vi.fn() },
    notification: { create: vi.fn() },
  };
  return {
    transaction,
    prisma: {
      restaurant: { findUnique: vi.fn() },
      restaurantTable: { findFirst: vi.fn() },
      dish: { findMany: vi.fn() },
      $transaction: vi.fn(),
    },
    findPublicTrackedOrder: vi.fn(),
    notifyOrderCreated: vi.fn(),
  };
});

vi.mock('@/lib/prisma', () => ({ prisma: mocks.prisma }));
vi.mock('@/lib/rate-limit', () => ({ enforceRateLimit: () => null }));
vi.mock('@/lib/orders/public-order', () => ({
  findPublicTrackedOrder: mocks.findPublicTrackedOrder,
}));
vi.mock('@/lib/orders/order-notifier', () => ({
  notifyOrderCreated: mocks.notifyOrderCreated,
}));

import { POST as createOrder } from './route';

const restaurant = {
  id: 'restaurant-1',
  name: 'Restaurant de test',
  phone: '+22997001122',
  deliveryFee: 300,
};

const dish = {
  id: 'dish-1',
  name: 'Plat de test',
  price: 1_000,
  optionGroups: [{
    id: 'group-1',
    minSelection: 1,
    maxSelection: 1,
    isRequired: true,
    options: [{ id: 'option-1', name: 'Supplément', price: 250, available: true }],
  }],
};

function request(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    restaurantId: restaurant.id,
    type: 'DELIVERY',
    customerName: 'Client',
    customerWhatsapp: '+22997001122',
    whatsappConsent: true,
    customerAddress: 'Cotonou',
    items: [{
      dishId: dish.id,
      quantity: 2,
      optionIds: ['option-1'],
      price: 1,
    }],
    ...overrides,
  };
}

describe('POST /api/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prisma.restaurant.findUnique.mockResolvedValue(restaurant);
    mocks.prisma.dish.findMany.mockResolvedValue([dish]);
    mocks.transaction.order.create.mockResolvedValue({
      id: 'order-1',
      restaurantId: restaurant.id,
      trackingCode: 'QR-ABCDEFG2',
    });
    mocks.transaction.orderItem.createMany.mockResolvedValue({ count: 1 });
    mocks.transaction.orderStatusHistory.create.mockResolvedValue({});
    mocks.transaction.notification.create.mockResolvedValue({});
    mocks.prisma.$transaction.mockImplementation(
      (callback: (transaction: typeof mocks.transaction) => Promise<unknown>) =>
        callback(mocks.transaction)
    );
    mocks.findPublicTrackedOrder.mockResolvedValue({
      trackingCode: 'QR-ABCDEFG2',
      restaurantName: restaurant.name,
      status: 'NEW',
      total: 2_800,
      items: [],
      statusHistory: [],
    });
    mocks.notifyOrderCreated.mockResolvedValue(undefined);
  });

  it('uses database dish/options prices and transactionally stores the initial history', async () => {
    const response = await createOrder(request(validPayload()));

    expect(response.status).toBe(201);
    expect(mocks.prisma.$transaction).toHaveBeenCalledOnce();
    expect(mocks.transaction.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ subtotal: 2_500, deliveryFee: 300, total: 2_800 }),
      })
    );
    expect(mocks.transaction.orderItem.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({
        price: 1_250,
        quantity: 2,
        options: [{ id: 'option-1', name: 'Supplément', price: 250 }],
      })],
    });
    expect(mocks.transaction.orderStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: 'NEW' }),
    });
    expect(mocks.transaction.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        restaurantId: restaurant.id,
        title: 'Nouvelle commande',
        type: 'NEW_ORDER',
      }),
    });
    expect(mocks.notifyOrderCreated).toHaveBeenCalledWith({
      id: 'order-1',
      trackingCode: 'QR-ABCDEFG2',
      restaurantId: restaurant.id,
    });
  });

  it('rejects a dine-in table that is not active in the requested restaurant', async () => {
    mocks.prisma.restaurantTable.findFirst.mockResolvedValue(null);

    const response = await createOrder(request(validPayload({
      type: 'DINE_IN',
      tableNumber: '9',
      customerAddress: undefined,
    })));

    expect(response.status).toBe(400);
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
    expect(mocks.transaction.order.create).not.toHaveBeenCalled();
  });

  it('keeps the created order successful when the notifier fails', async () => {
    mocks.notifyOrderCreated.mockRejectedValueOnce(new Error('Notifier unavailable'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      const response = await createOrder(request(validPayload()));

      expect(response.status).toBe(201);
      expect(mocks.transaction.order.create).toHaveBeenCalledOnce();
    } finally {
      errorSpy.mockRestore();
    }
  });
});
