import { afterEach, describe, expect, it, vi } from 'vitest';
import { submitDish } from './client';

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
