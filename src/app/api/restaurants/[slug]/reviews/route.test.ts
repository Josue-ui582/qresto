import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  review: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ prisma: { review: mocks.review } }));

import { GET } from './route';

describe('GET /api/restaurants/[slug]/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.review.findMany.mockResolvedValue([]);
    mocks.review.count.mockResolvedValue(0);
  });

  it('returns only visible review fields with pagination', async () => {
    const request = new NextRequest(
      'http://localhost/api/restaurants/example/reviews?page=2&pageSize=5'
    );
    const response = await GET(request, { params: Promise.resolve({ slug: 'example' }) });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      reviews: [],
      pagination: { page: 2, pageSize: 5, total: 0, pageCount: 0 },
    });
    expect(mocks.review.findMany).toHaveBeenCalledWith({
      where: { restaurant: { slug: 'example' }, isVisible: true },
      orderBy: { createdAt: 'desc' },
      skip: 5,
      take: 5,
      select: {
        customerName: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    });
  });
});
