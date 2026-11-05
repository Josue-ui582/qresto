import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  prisma: {
    dish: {
      updateMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/lib/prisma', () => ({ prisma: mocks.prisma }));
vi.mock('@/lib/auth/session', () => ({
  authorizeRequest: vi.fn().mockResolvedValue({
    session: { restaurantId: 'restaurant-1' },
    response: null,
  }),
}));

import { PUT as updateDish } from './route';

describe('PUT /api/dishes availability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prisma.dish.updateMany.mockResolvedValue({ count: 1 });
    mocks.prisma.dish.findFirst.mockResolvedValue({
      id: 'dish-1',
      isAvailable: true,
      stockQuantity: 0,
    });
  });

  it('allows enabling a dish when its tracked stock is empty', async () => {
    const request = new NextRequest('http://localhost/api/dishes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'dish-1', isAvailable: true }),
    });

    const response = await updateDish(request);

    expect(response.status).toBe(200);
    expect(mocks.prisma.dish.updateMany).toHaveBeenCalledWith({
      where: { id: 'dish-1', restaurantId: 'restaurant-1' },
      data: { isAvailable: true },
    });
  });
});
