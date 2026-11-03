export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export type SupportedImageType = {
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  extension: 'jpg' | 'png' | 'webp';
};

const SUPPORTED_IMAGE_TYPES: SupportedImageType[] = [
  { contentType: 'image/jpeg', extension: 'jpg' },
  { contentType: 'image/png', extension: 'png' },
  { contentType: 'image/webp', extension: 'webp' },
];

export function detectImageType(bytes: Uint8Array): SupportedImageType | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return SUPPORTED_IMAGE_TYPES[0];
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return SUPPORTED_IMAGE_TYPES[1];
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.subarray(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.subarray(8, 12)) === 'WEBP'
  ) {
    return SUPPORTED_IMAGE_TYPES[2];
  }
  return null;
}

export function validateImageUrl(value: string): boolean {
  if (value.length > 2048 || value.startsWith('data:')) return false;
  if (/^\/api\/uploads\/[0-9a-f-]+\.(?:jpg|png|webp)$/i.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
