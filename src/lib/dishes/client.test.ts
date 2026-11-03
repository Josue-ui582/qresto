import { afterEach, describe, expect, it, vi } from 'vitest';
import { submitDish } from './client';
import { uploadImage } from '@/lib/uploads/client';

const payload = (imageUrl: string) => ({
  name: 'Plat de test',
  price: 2500,
  categoryId: 'category-1',
  imageUrl,
});

describe('submitDish', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('never sends a data URL to /api/dishes', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(submitDish(payload('data:image/png;base64,AAAA'))).rejects.toThrow(
      'L’image n’a pas été téléversée'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uploads a multi-megabyte file before sending only its short URL to /api/dishes', async () => {
    const imageUrl = '/api/uploads/123e4567-e89b-12d3-a456-426614174000.png';
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, imageUrl }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    const file = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'dish.png', { type: 'image/png' });

    const uploadedUrl = await uploadImage(file);
    await submitDish(payload(uploadedUrl));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/uploads');
    expect(fetchMock.mock.calls[0][1].body).toBeInstanceOf(FormData);
    expect((fetchMock.mock.calls[0][1].body as FormData).get('file')).toBe(file);
    expect(fetchMock.mock.calls[1][0]).toBe('/api/dishes');
    expect(fetchMock.mock.calls[1][1].body).toBe(JSON.stringify(payload(imageUrl)));
    expect(fetchMock.mock.calls[1][1].body).not.toContain('data:');
  });

  it('blocks mixed-case data URLs before calling /api/dishes', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(submitDish(payload('DATA:image/png;base64,AAAA'))).rejects.toThrow(
      'L’image n’a pas été téléversée'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends a validated short upload URL to /api/dishes', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 201 })
    );
    vi.stubGlobal('fetch', fetchMock);

    await submitDish(payload('/api/uploads/123e4567-e89b-12d3-a456-426614174000.jpg'));

    expect(fetchMock).toHaveBeenCalledWith('/api/dishes', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(payload('/api/uploads/123e4567-e89b-12d3-a456-426614174000.jpg')),
    }));
    expect(fetchMock.mock.calls[0][1].body).not.toContain('data:image');
  });

  it('maps server validation errors to named fields', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        error: 'Données invalides.',
        details: [{ path: ['imageUrl'], message: 'URL image invalide.' }],
      }), { status: 400 })
    ));

    await expect(submitDish(payload('https://images.example.test/dish.png'))).rejects.toMatchObject({
      message: 'Image : URL image invalide.',
      fieldErrors: { imageUrl: 'URL image invalide.' },
    });
  });
});
