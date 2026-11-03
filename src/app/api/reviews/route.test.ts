import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => {
  const transaction = {
    review: {
      create: vi.fn(),
      aggregate: vi.fn(),
      updateMany: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    restaurant: { update: vi.fn() },
    notification: { create: vi.fn() },
  };
  return {
    transaction,
    prisma: {
      order: { findUnique: vi.fn() },
      review: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        aggregate: vi.fn(),
        groupBy: vi.fn(),
      },
      $transaction: vi.fn(),
    },
    authorizeRequest: vi.fn(),
    publishRestaurantEvent: vi.fn(),
  };
});

vi.mock('@/lib/prisma', () => ({ prisma: mocks.prisma }));
vi.mock('@/lib/rate-limit', () => ({ enforceRateLimit: () => null }));
vi.mock('@/lib/auth/session', () => ({ authorizeRequest: mocks.authorizeRequest }));
vi.mock('@/lib/realtime/event-bus', () => ({
  publishRestaurantEvent: mocks.publishRestaurantEvent,
}));

import { GET, POST, PUT } from './route';

function request(
  body?: Record<string, unknown>,
  method: 'GET' | 'POST' | 'PUT' = 'POST',
  url = 'http://localhost/api/reviews'
) {
  return new NextRequest(url, {
    method,
    ...(body ? {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    } : {}),
  });
}

describe('/api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      restaurantId: 'restaurant-1',
      status: 'DELIVERED',
      review: null,
    });
    mocks.prisma.review.findFirst.mockResolvedValue(null);
    mocks.prisma.review.findMany.mockResolvedValue([]);
    mocks.prisma.review.count.mockResolvedValue(0);
    mocks.prisma.review.aggregate.mockResolvedValue({
      _avg: { rating: 0 },
      _count: { _all: 0 },
    });
    mocks.prisma.review.groupBy.mockResolvedValue([]);
    mocks.transaction.review.create.mockResolvedValue({
      id: 'review-1',
      customerName: 'Client',
      rating: 5,
      comment: 'Très bon',
      createdAt: new Date('2026-11-03T08:00:00.000Z'),
    });
    mocks.transaction.review.aggregate.mockResolvedValue({
      _avg: { rating: 5 },
      _count: { _all: 1 },
    });
    mocks.transaction.review.findFirst.mockResolvedValue({ id: 'review-1', isVisible: true });
    mocks.transaction.review.updateMany.mockResolvedValue({ count: 1 });
    mocks.transaction.restaurant.update.mockResolvedValue({});
    mocks.transaction.notification.create.mockResolvedValue({});
    mocks.prisma.$transaction.mockImplementation(
      (callback: (transaction: typeof mocks.transaction) => Promise<unknown>) =>
        callback(mocks.transaction)
    );
    mocks.authorizeRequest.mockResolvedValue({
      session: { restaurantId: 'restaurant-1' },
    });
  });

  it('creates a review, sanitizes text, updates aggregates and adds a notification atomically', async () => {
    const response = await POST(request({
      trackingCode: 'QR-ABCDEFG2',
      customerName: ' <b>Client</b> ',
      rating: 5,
      comment: '<script>alert(1)</script><p>Très bon</p>',
    }));

    expect(response.status).toBe(201);
    expect(mocks.prisma.$transaction).toHaveBeenCalledOnce();
    expect(mocks.transaction.review.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: 'order-1',
        restaurantId: 'restaurant-1',
        customerName: 'Client',
        rating: 5,
        comment: 'Très bon',
        isVisible: true,
      }),
      select: { customerName: true, rating: true, comment: true, createdAt: true },
    });
    expect(mocks.transaction.restaurant.update).toHaveBeenCalledWith({
      where: { id: 'restaurant-1' },
      data: { rating: 5, reviewCount: 1 },
    });
    expect(mocks.transaction.review.aggregate).toHaveBeenCalledWith({
      where: { restaurantId: 'restaurant-1', isVisible: true },
      _avg: { rating: true },
      _count: { _all: true },
    });
    expect(mocks.transaction.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        restaurantId: 'restaurant-1',
        title: 'Nouvel avis',
        type: 'NEW_REVIEW',
      }),
    });
    expect(mocks.publishRestaurantEvent).toHaveBeenCalledWith(
      'restaurant-1',
      { type: 'review.created' }
    );
    expect(JSON.stringify(await response.json())).not.toContain('customerWhatsapp');
  });

  it('rejects duplicate reviews without creating another one', async () => {
    mocks.prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      restaurantId: 'restaurant-1',
      status: 'DELIVERED',
      review: { id: 'existing' },
    });

    const response = await POST(request({ trackingCode: 'QR-ABCDEFG2', rating: 5 }));

    expect(response.status).toBe(409);
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects orders that are not delivered and returns a neutral error for unknown codes', async () => {
    mocks.prisma.order.findUnique.mockResolvedValueOnce({
      id: 'order-1',
      restaurantId: 'restaurant-1',
      status: 'PREPARING',
      review: null,
    });
    const unfinishedResponse = await POST(request({
      trackingCode: 'QR-ABCDEFG2',
      rating: 5,
    }));
    expect(unfinishedResponse.status).toBe(400);

    mocks.prisma.order.findUnique.mockResolvedValueOnce(null);
    const invalidCodeResponse = await POST(request({
      trackingCode: 'QR-ABCDEFG2',
      rating: 5,
    }));
    expect(invalidCodeResponse.status).toBe(400);
    expect(await invalidCodeResponse.json()).toEqual({
      error: 'Cette commande ne permet pas de déposer un avis.',
    });
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });

  it('validates rating and comment length', async () => {
    const invalidRating = await POST(request({
      trackingCode: 'QR-ABCDEFG2',
      rating: 6,
    }));
    const longComment = await POST(request({
      trackingCode: 'QR-ABCDEFG2',
      rating: 5,
      comment: 'x'.repeat(1001),
    }));

    expect(invalidRating.status).toBe(400);
    expect(longComment.status).toBe(400);
    expect(mocks.prisma.order.findUnique).not.toHaveBeenCalled();
  });

  it('returns an existing public review by tracking code without private order data', async () => {
    mocks.prisma.review.findFirst.mockResolvedValue({
      customerName: 'Client',
      rating: 4,
      comment: 'Très bon',
      createdAt: new Date('2026-11-03T08:00:00.000Z'),
    });

    const response = await GET(request(
      undefined,
      'GET',
      'http://localhost/api/reviews?code=QR-ABCDEFG2'
    ));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      review: { customerName: 'Client', rating: 4, comment: 'Très bon' },
    });
    expect(mocks.prisma.review.findFirst).toHaveBeenCalledWith({
      where: { order: { trackingCode: 'QR-ABCDEFG2' } },
      select: { customerName: true, rating: true, comment: true, createdAt: true },
    });
  });

  it('scopes dashboard listing and moderation to the authenticated restaurant', async () => {
    const listResponse = await GET(request(
      undefined,
      'GET',
      'http://localhost/api/reviews?restaurantId=restaurant-1'
    ));
    expect(listResponse.status).toBe(200);
    expect(mocks.authorizeRequest).toHaveBeenCalledWith(
      expect.any(NextRequest),
      'REVIEWS_ADMIN',
      'restaurant-1'
    );
    expect(mocks.prisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { restaurantId: 'restaurant-1' },
      })
    );

    const moderateResponse = await PUT(request({ id: 'review-foreign', isVisible: false }, 'PUT'));
    expect(moderateResponse.status).toBe(200);
    expect(mocks.transaction.review.findFirst).toHaveBeenCalledWith({
      where: { id: 'review-foreign', restaurantId: 'restaurant-1' },
      select: { id: true, isVisible: true },
    });
    expect(mocks.transaction.review.updateMany).toHaveBeenCalledWith({
      where: { id: 'review-1', restaurantId: 'restaurant-1' },
      data: { isVisible: false, isApproved: false },
    });
    expect(mocks.transaction.restaurant.update).toHaveBeenCalled();
  });

  it('does not modify an avis belonging to another restaurant', async () => {
    mocks.transaction.review.findFirst.mockResolvedValueOnce(null);

    const response = await PUT(request({ id: 'review-foreign', isVisible: false }, 'PUT'));

    expect(response.status).toBe(404);
    expect(mocks.transaction.review.updateMany).not.toHaveBeenCalled();
    expect(mocks.transaction.restaurant.update).not.toHaveBeenCalled();
  });
});
