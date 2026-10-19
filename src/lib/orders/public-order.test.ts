import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockFindUnique } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: { order: { findUnique: mockFindUnique } },
}));

import { findPublicTrackedOrder } from './public-order';

describe('findPublicTrackedOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns only the order fields required by the public tracking screen', async () => {
    mockFindUnique.mockResolvedValue({
      trackingCode: 'QR-123456789ABC',
      restaurantName: 'Restaurant A',
      status: 'PREPARING',
      total: 2_500,
      items: [{ name: 'Plat', price: 2_500, quantity: 1 }],
      statusHistory: [{
        status: 'PREPARING',
        timestamp: new Date('2026-01-01T10:00:00.000Z'),
        comment: 'En préparation',
      }],
    });

    const trackedOrder = await findPublicTrackedOrder('qr-123456789abc');

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { trackingCode: 'QR-123456789ABC' },
      select: {
        trackingCode: true,
        restaurantName: true,
        status: true,
        total: true,
        items: { select: { name: true, price: true, quantity: true } },
        statusHistory: {
          select: { status: true, timestamp: true, comment: true },
          orderBy: { timestamp: 'asc' },
        },
      },
    });
    expect(trackedOrder).toEqual({
      trackingCode: 'QR-123456789ABC',
      restaurantName: 'Restaurant A',
      status: 'PREPARING',
      total: 2_500,
      items: [{ name: 'Plat', price: 2_500, quantity: 1 }],
      statusHistory: [{
        status: 'PREPARING',
        timestamp: new Date('2026-01-01T10:00:00.000Z'),
        note: 'En préparation',
      }],
    });
    expect(trackedOrder).not.toHaveProperty('customerPhone');
    expect(trackedOrder).not.toHaveProperty('customerAddress');
  });
});
