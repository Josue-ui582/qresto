import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  authorizeRequest: vi.fn(),
  aggregate: vi.fn(),
  groupBy: vi.fn(),
  queryRaw: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({ authorizeRequest: mocks.authorizeRequest }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      aggregate: mocks.aggregate,
      groupBy: mocks.groupBy,
    },
    $queryRaw: mocks.queryRaw,
  },
}));

import { GET } from './route';

function request(query = '') {
  return new NextRequest(`http://localhost/api/analytics${query}`);
}

describe('GET /api/analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authorizeRequest.mockResolvedValue({
      session: { restaurantId: 'restaurant-1' },
    });
    mocks.aggregate.mockResolvedValue({
      _sum: { total: 3_600 },
      _count: { id: 3 },
      _avg: { total: 1_200 },
    });
    mocks.groupBy.mockImplementation(({ by }: { by: string[] }) => (
      by[0] === 'status'
        ? Promise.resolve([{ status: 'NEW', _count: { id: 2 } }])
        : Promise.resolve([{ type: 'DINE_IN', _count: { id: 3 } }])
    ));
    mocks.queryRaw.mockImplementation((query: { sql: string }) => {
      if (query.sql.includes('FROM order_items')) {
        return Promise.resolve([{
          id: 'dish-1',
          name: 'Plat',
          category: 'Déjeuner',
          quantity: 3,
          revenue: 3_000,
        }]);
      }
      if (query.sql.includes('EXTRACT(HOUR')) {
        return Promise.resolve([{ hour: 12, count: 2 }]);
      }
      return Promise.resolve([{ count: 1 }]);
    });
  });

  it('returns DB aggregates and timezone-aware custom range breakdowns', async () => {
    const response = await GET(request(
      '?period=custom&startDate=2026-11-02&endDate=2026-11-03&timeZone=Africa%2FPorto-Novo'
    ));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.stats).toEqual({
      totalRevenue: 3_600,
      totalOrders: 3,
      averageOrderValue: 1_200,
      activeTablesCount: 1,
      ordersByStatus: [{ status: 'NEW', count: 2 }],
      ordersByType: [{ type: 'DINE_IN', count: 3 }],
      topItems: [{
        id: 'dish-1',
        name: 'Plat',
        category: 'Déjeuner',
        quantity: 3,
        revenue: 3_000,
      }],
      peakHours: [{ hour: 12, count: 2 }],
    });
    expect(body.range).toEqual({
      startDate: '2026-11-01T23:00:00.000Z',
      endDate: '2026-11-03T23:00:00.000Z',
    });
    expect(mocks.aggregate).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        restaurantId: 'restaurant-1',
        status: { not: 'CANCELLED' },
      }),
    }));
    expect(mocks.queryRaw).toHaveBeenCalledTimes(3);
  });

  it('rejects malformed custom date ranges before querying data', async () => {
    const response = await GET(request(
      '?period=custom&startDate=2026-11-04&endDate=2026-11-03'
    ));

    expect(response.status).toBe(400);
    expect(mocks.aggregate).not.toHaveBeenCalled();
  });

  it('uses the quoted camelCase columns in raw SQL and scopes every aggregate to the session restaurant', async () => {
    await GET(request('?period=week&restaurantId=restaurant-1'));

    expect(mocks.aggregate).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ restaurantId: 'restaurant-1' }),
    }));
    expect(mocks.queryRaw.mock.calls.map(([query]) => query.sql).join('\n')).toContain('"restaurantId"');
    expect(mocks.queryRaw.mock.calls.map(([query]) => query.sql).join('\n')).toContain('"createdAt"');
    expect(mocks.queryRaw.mock.calls.map(([query]) => query.sql).join('\n')).toContain('"dishId"');
    expect(mocks.queryRaw.mock.calls.map(([query]) => query.sql).join('\n')).not.toContain('created_at');
    expect(mocks.queryRaw.mock.calls.map(([query]) => query.sql).join('\n')).not.toContain('dish_id');
  });

  it('returns stable zero-valued aggregates when the restaurant has no orders', async () => {
    mocks.aggregate.mockResolvedValue({
      _sum: { total: null },
      _count: { id: 0 },
      _avg: { total: null },
    });
    mocks.groupBy.mockResolvedValue([]);
    mocks.queryRaw.mockResolvedValue([]);

    const response = await GET(request('?period=week'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.stats).toEqual({
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      activeTablesCount: 0,
      ordersByStatus: [],
      ordersByType: [],
      topItems: [],
      peakHours: [],
    });
  });
});
