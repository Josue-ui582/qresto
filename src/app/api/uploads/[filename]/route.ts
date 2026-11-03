import { NextRequest, NextResponse } from 'next/server';
import { readLocalImage } from '@/lib/uploads/storage';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!/^[0-9a-f-]{36}\.(?:jpg|png|webp)$/i.test(filename)) {
    return NextResponse.json({ error: 'Image introuvable.' }, { status: 404 });
  }

  try {
    const image = await readLocalImage(filename);
    return new NextResponse(new Uint8Array(image.bytes), {
      headers: {
        'Content-Type': image.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'inline',
      },
    });
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Image introuvable.' }, { status: 404 });
    }
    console.error('Erreur lors de la lecture d’une image stockée.', error);
    return NextResponse.json({ error: 'Impossible de lire l’image.' }, { status: 500 });
  }
}
