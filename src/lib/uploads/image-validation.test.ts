import { describe, expect, it } from 'vitest';
import { detectImageType, MAX_IMAGE_SIZE_BYTES, validateImageUrl } from './image-validation';

describe('uploaded image validation', () => {
  it('identifies supported formats from their magic bytes', () => {
    expect(detectImageType(Uint8Array.from([0xff, 0xd8, 0xff, 0x00]) )?.contentType).toBe('image/jpeg');
    expect(detectImageType(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.contentType).toBe('image/png');
    expect(detectImageType(Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))?.contentType).toBe('image/webp');
    expect(detectImageType(new TextEncoder().encode('<html>'))).toBeNull();
  });

  it('accepts web URLs and internal upload paths but rejects data URLs', () => {
    expect(validateImageUrl('https://images.example.com/dish.jpg')).toBe(true);
    expect(validateImageUrl('/api/uploads/123e4567-e89b-12d3-a456-426614174000.jpg')).toBe(true);
    expect(validateImageUrl('data:image/png;base64,AAAA')).toBe(false);
    expect(validateImageUrl('javascript:alert(1)')).toBe(false);
    expect(validateImageUrl(`https://example.com/${'x'.repeat(MAX_IMAGE_SIZE_BYTES)}`)).toBe(false);
  });
});
