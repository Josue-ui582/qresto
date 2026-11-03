import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  authorizeRequest: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({ authorizeRequest: mocks.authorizeRequest }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      findMany: mocks.findMany,
      count: mocks.count,
      updateMany: mocks.updateMany,
    },
  },
}));

import { GET, PATCH } from './route';

describe('/api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authorizeRequest.mockResolvedValue({
      session: { restaurantId: 'restaurant-1' },
    });
    mocks.findMany.mockResolvedValue([]);
    mocks.count.mockResolvedValue(0);
    mocks.updateMany.mockResolvedValue({ count: 1 });
  });

  it('returns only the authenticated restaurant notifications and unread count', async () => {
    const response = await GET(new NextRequest('http://localhost/api/notifications'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, data: [], unreadCount: 0 });
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { restaurantId: 'restaurant-1' }, take: 50 })
    );
    expect(mocks.count).toHaveBeenCalledWith({
      where: { restaurantId: 'restaurant-1', isRead: false },
    });
  });

  it('updates read state only within the authenticated restaurant', async () => {
    const response = await PATCH(new NextRequest('http://localhost/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'notification-1', isRead: true }),
    }));

    expect(response.status).toBe(200);
    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: { id: 'notification-1', restaurantId: 'restaurant-1' },
      data: { isRead: true },
    });
  });
});
