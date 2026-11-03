import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { deflateSync } from 'node:zlib';

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

function crc32(value: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of value) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Buffer {
  const typeBytes = Buffer.from(type, 'ascii');
  const chunkData = Buffer.concat([typeBytes, Buffer.from(data)]);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(chunkData));
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  return Buffer.concat([length, chunkData, checksum]);
}

function createMultiMegabytePng(): Buffer {
  const width = 1024;
  const height = 1024;
  const pixels = Buffer.alloc((width * 3 + 1) * height);
  let seed = 0x12345678;
  for (let row = 0; row < height; row += 1) {
    const rowStart = row * (width * 3 + 1);
    pixels[rowStart] = 0;
    for (let index = rowStart + 1; index < rowStart + width * 3 + 1; index += 1) {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      pixels[index] = seed & 0xff;
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    signature,
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(pixels)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
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
    const svg = await POST(request(new File(
      [new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>')],
      'dish.svg',
      { type: 'image/svg+xml' }
    )));

    expect(badType.status).toBe(415);
    expect(tooLarge.status).toBe(413);
    expect(fakeImage.status).toBe(415);
    expect(svg.status).toBe(415);
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

  it('accepts a real PNG file larger than 2 MB and returns a short URL', async () => {
    const png = createMultiMegabytePng();
    expect(png.byteLength).toBeGreaterThan(2 * 1024 * 1024);
    expect(png.byteLength).toBeLessThan(5 * 1024 * 1024);

    const response = await POST(request(new File([Uint8Array.from(png)], 'dish.png', { type: 'image/png' })));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({
      success: true,
      imageUrl: '/api/uploads/123e4567-e89b-12d3-a456-426614174000.png',
    });
    expect(body.imageUrl.length).toBeLessThan(2048);
    expect(mocks.store).toHaveBeenCalledWith(
      expect.any(Uint8Array),
      expect.objectContaining({ contentType: 'image/png', extension: 'png' })
    );
    expect(mocks.store.mock.calls[0][0]).toHaveLength(png.byteLength);
  });
});
