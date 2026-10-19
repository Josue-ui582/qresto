import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { mockPrisma, mockAuthorizeRequest } = vi.hoisted(() => ({
  mockPrisma: {
    order: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
  mockAuthorizeRequest: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('@/lib/auth/session', () => ({ authorizeRequest: mockAuthorizeRequest }));

import { GET as getOrders } from './route';
import { PATCH as updateOrderStatus } from './[trackingCode]/route';

const restaurantSession = {
  userId: 'owner-a',
  role: 'RESTAURANT_OWNER',
  restaurantId: 'restaurant-a',
  staffRole: null,
  user: {
    id: 'owner-a',
    email: 'owner@example.test',
    firstName: 'Owner',
    lastName: 'A',
    phone: '',
    role: 'RESTAURANT_OWNER',
  },
};

describe('order API tenant isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthorizeRequest.mockResolvedValue({ session: restaurantSession });
  });

  it('only queries orders belonging to the authenticated restaurant', async () => {
    mockPrisma.order.findMany.mockResolvedValue([]);

    const response = await getOrders(
      new NextRequest('http://localhost/api/orders?restaurantId=restaurant-a')
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { restaurantId: 'restaurant-a' },
      })
    );
    expect(mockAuthorizeRequest).toHaveBeenCalledWith(
      expect.any(NextRequest),
      'ORDERS_READ',
      'restaurant-a'
    );
  });

  it('does not update an order outside the authenticated restaurant', async () => {
    mockPrisma.order.findFirst.mockResolvedValue(null);

    const response = await updateOrderStatus(
      new NextRequest('http://localhost/api/orders/foreign-order', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PREPARING' }),
      }),
      { params: Promise.resolve({ trackingCode: 'foreign-order' }) }
    );

    expect(response.status).toBe(404);
    expect(mockPrisma.order.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          restaurantId: 'restaurant-a',
          OR: [
            { id: 'foreign-order' },
            { trackingCode: 'FOREIGN-ORDER' },
          ],
        }),
      })
    );
    expect(mockPrisma.order.update).not.toHaveBeenCalled();
  });
});
