import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mocks = vi.hoisted(() => ({
  authorizeRequest: vi.fn(),
  store: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({ authorizeRequest: mocks.authorizeRequest }));
vi.mock('@/lib/uploads/storage', () => ({
  getStorageProvider: () => ({ store: mocks.store }),
}));

import { POST } from './route';

function request(file: File) {
  const form = new FormData();
  form.set('file', file);
  return new NextRequest('http://localhost/api/uploads', { method: 'POST', body: form });
}

describe('POST /api/uploads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authorizeRequest.mockResolvedValue({ session: { restaurantId: 'restaurant-1' } });
    mocks.store.mockResolvedValue('/api/uploads/123e4567-e89b-12d3-a456-426614174000.png');
  });

  it('rejects unauthenticated uploads', async () => {
    mocks.authorizeRequest.mockResolvedValue({
      response: NextResponse.json({ error: 'Non authentifié.' }, { status: 401 }),
    });
    const image = new File([
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ], 'dish.png', { type: 'image/png' });
    expect((await POST(request(image))).status).toBe(401);
  });

  it('rejects unsupported, oversized, and fake image files before storing', async () => {
    const badType = await POST(request(new File([new TextEncoder().encode('<html>')], 'dish.png', { type: 'image/png' })));
    const largeFile = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'dish.png', { type: 'image/png' });
    const tooLarge = await POST(request(largeFile));
    const fakeImage = await POST(request(new File([new TextEncoder().encode('<html>')], 'fake.jpg', { type: 'image/jpeg' })));

    expect(badType.status).toBe(415);
    expect(tooLarge.status).toBe(413);
    expect(fakeImage.status).toBe(415);
    expect(mocks.store).not.toHaveBeenCalled();
  });

  it('stores a valid PNG and returns a short URL', async () => {
    const result = await POST(request(new File([
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ], 'dish.png', { type: 'image/png' })));
    const body = await result.json();

    expect(result.status).toBe(201);
    expect(body.imageUrl).toBe('/api/uploads/123e4567-e89b-12d3-a456-426614174000.png');
    expect(mocks.store).toHaveBeenCalledOnce();
  });
});
