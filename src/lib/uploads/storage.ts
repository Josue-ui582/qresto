import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { SupportedImageType } from './image-validation';

export interface StorageProvider {
  store(bytes: Uint8Array, imageType: SupportedImageType): Promise<string>;
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
    await writeFile(join(directory, filename), bytes, { flag: 'wx', mode: 0o640 });
    return `/api/uploads/${filename}`;
  }
}

class CloudinaryStorageProvider implements StorageProvider {
  async store(bytes: Uint8Array, imageType: SupportedImageType): Promise<string> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('La configuration Cloudinary est incomplète.');
    }

    const publicId = randomUUID();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signaturePayload = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash('sha1').update(signaturePayload).digest('hex');
    const formData = new FormData();
    const imageBuffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(imageBuffer).set(bytes);
    formData.set('file', new Blob([imageBuffer], { type: imageType.contentType }), `upload.${imageType.extension}`);
    formData.set('api_key', apiKey);
    formData.set('public_id', publicId);
    formData.set('timestamp', timestamp);
    formData.set('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
      { method: 'POST', body: formData }
    );
    const result: unknown = await response.json();
    if (
      !response.ok ||
      typeof result !== 'object' ||
      result === null ||
      !('secure_url' in result) ||
      typeof result.secure_url !== 'string'
    ) {
      throw new Error('Le stockage Cloudinary a refusé le téléversement.');
    }
    return result.secure_url;
  }
}

export function getStorageProvider(): StorageProvider {
  const provider = process.env.UPLOAD_STORAGE_PROVIDER || 'local';
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
  const bytes = await readFile(join(localStorageDirectory(), filename));
  return { bytes, contentType };
}
