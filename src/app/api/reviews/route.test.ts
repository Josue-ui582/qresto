import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => {
  const transaction = {
    review: { create: vi.fn() },
    notification: { create: vi.fn() },
  };
  return {
    transaction,
    prisma: {
      order: { findUnique: vi.fn() },
      $transaction: vi.fn(),
    },
  };
});

vi.mock('@/lib/prisma', () => ({ prisma: mocks.prisma }));
vi.mock('@/lib/rate-limit', () => ({ enforceRateLimit: () => null }));

import { POST } from './route';

function request(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      restaurantId: 'restaurant-1',
      status: 'DELIVERED',
      review: null,
    });
    mocks.transaction.review.create.mockResolvedValue({
      id: 'review-1',
      rating: 5,
      createdAt: new Date('2026-11-03T08:00:00.000Z'),
    });
    mocks.transaction.notification.create.mockResolvedValue({});
    mocks.prisma.$transaction.mockImplementation(
      (callback: (transaction: typeof mocks.transaction) => Promise<unknown>) =>
        callback(mocks.transaction)
    );
  });

  it('creates a review and its notification in one transaction', async () => {
    const response = await POST(request({
      trackingCode: 'QR-ABCDEFG2',
      customerName: 'Client',
      rating: 5,
      comment: 'Très bon',
    }));

    expect(response.status).toBe(201);
    expect(mocks.prisma.$transaction).toHaveBeenCalledOnce();
    expect(mocks.transaction.review.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: 'order-1',
        restaurantId: 'restaurant-1',
        rating: 5,
      }),
      select: { id: true, rating: true, createdAt: true },
    });
    expect(mocks.transaction.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        restaurantId: 'restaurant-1',
        type: 'NEW_REVIEW',
      }),
    });
  });

  it('rejects ratings outside the supported range', async () => {
    const response = await POST(request({
      trackingCode: 'QR-ABCDEFG2',
      customerName: 'Client',
      rating: 6,
    }));

    expect(response.status).toBe(400);
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });
});
