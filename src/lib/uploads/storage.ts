import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getAppConfig } from '@/lib/config/env';
import type { SupportedImageType } from './image-validation';

export interface StorageProvider {
  store(bytes: Uint8Array, imageType: SupportedImageType, restaurantId: string): Promise<string>;
}

export interface StoredLocalImage {
  bytes: Buffer;
  contentType: SupportedImageType['contentType'];
}

function localStorageDirectory(): string {
  return process.env.UPLOADS_DIRECTORY || join(process.cwd(), '.qresto-uploads');
}

class LocalStorageProvider implements StorageProvider {
  async store(bytes: Uint8Array, imageType: SupportedImageType): Promise<string> {
    const filename = `${randomUUID()}.${imageType.extension}`;
    const directory = localStorageDirectory();
    await mkdir(directory, { recursive: true });
    await writeFile(
      join(/*turbopackIgnore: true*/ directory, filename),
      bytes,
      { flag: 'wx', mode: 0o640 }
    );
    return `/api/uploads/${filename}`;
  }
}

class CloudinaryStorageProvider implements StorageProvider {
  async store(
    bytes: Uint8Array,
    imageType: SupportedImageType,
    restaurantId: string
  ): Promise<string> {
    const config = getAppConfig();
    const cloudName = config.CLOUDINARY_CLOUD_NAME;
    const apiKey = config.CLOUDINARY_API_KEY;
    const apiSecret = config.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('La configuration Cloudinary est incomplète.');
    }
    const publicId = randomUUID();
    const folder = `restaurants/${restaurantId}`;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signaturePayload = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash('sha1').update(signaturePayload).digest('hex');
    const formData = new FormData();
    const imageBuffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(imageBuffer).set(bytes);
    formData.set('file', new Blob([imageBuffer], { type: imageType.contentType }), `upload.${imageType.extension}`);
    formData.set('api_key', apiKey);
    formData.set('folder', folder);
    formData.set('public_id', publicId);
    formData.set('timestamp', timestamp);
    formData.set('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
      { method: 'POST', body: formData, signal: AbortSignal.timeout(8_000) }
    );
    const result: unknown = await response.json();
    if (
      !response.ok ||
      typeof result !== 'object' ||
      result === null ||
      !('secure_url' in result) ||
      typeof result.secure_url !== 'string' ||
      !isCloudinarySecureUrl(result.secure_url)
    ) {
      throw new Error('Le stockage Cloudinary a refusé le téléversement.');
    }
    return result.secure_url;
  }
}

function isCloudinarySecureUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.endsWith('.cloudinary.com');
  } catch {
    return false;
  }
}

export function getStorageProvider(): StorageProvider {
  const provider = getAppConfig().STORAGE_PROVIDER;
  if (provider === 'local') return new LocalStorageProvider();
  if (provider === 'cloudinary') return new CloudinaryStorageProvider();
  throw new Error('Le fournisseur de stockage d’images configuré est invalide.');
}

export async function readLocalImage(filename: string): Promise<StoredLocalImage> {
  const extension = filename.split('.').at(-1);
  const contentType = extension === 'jpg' ? 'image/jpeg'
    : extension === 'png' ? 'image/png'
      : extension === 'webp' ? 'image/webp' : null;
  if (!contentType) throw new Error('Format d’image local invalide.');
  const bytes = await readFile(join(/*turbopackIgnore: true*/ localStorageDirectory(), filename));
  return { bytes, contentType };
}
