import { NextRequest, NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/auth/session';
import { detectImageType, MAX_IMAGE_SIZE_BYTES } from '@/lib/uploads/image-validation';
import { getStorageProvider } from '@/lib/uploads/storage';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await authorizeRequest(request, 'MENU_WRITE');
  if (auth.response) return auth.response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Le fichier envoyé est invalide.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Sélectionnez un fichier image.' }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json({ error: 'L’image dépasse la taille maximale de 5 Mo.' }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const imageType = detectImageType(bytes);
  if (!imageType) {
    return NextResponse.json(
      { error: 'Type d’image refusé. Utilisez un fichier JPEG, PNG ou WebP valide.' },
      { status: 415 }
    );
  }

  try {
    const imageUrl = await getStorageProvider().store(bytes, imageType);
    return NextResponse.json({ success: true, imageUrl }, { status: 201 });
  } catch (error: unknown) {
    console.error('Erreur lors du stockage d’une image.', error);
    return NextResponse.json(
      { error: 'Impossible de stocker l’image pour le moment.' },
      { status: 500 }
    );
  }
}
