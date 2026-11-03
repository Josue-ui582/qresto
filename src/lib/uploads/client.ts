import { getApiErrorMessage, isApiSuccess } from '@/lib/api/client-error';
import { MAX_IMAGE_SIZE_BYTES, validateImageUrl } from '@/lib/uploads/image-validation';

const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function uploadImage(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('L’image dépasse la taille maximale de 5 Mo.');
  }
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Type refusé. Sélectionnez une image JPEG, PNG ou WebP.');
  }

  const formData = new FormData();
  formData.set('file', file);

  let response: Response;
  try {
    response = await fetch('/api/uploads', { method: 'POST', body: formData });
  } catch {
    throw new Error('Erreur réseau : impossible de téléverser l’image.');
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new Error('Réponse invalide du serveur lors du téléversement.');
  }

  if (!response.ok || !isApiSuccess(result) || !('imageUrl' in result)) {
    const message = response.status === 401
      ? 'Votre session a expiré. Reconnectez-vous puis téléversez à nouveau l’image.'
      : getApiErrorMessage(result, 'Impossible de téléverser cette image.');
    throw new Error(message);
  }

  const imageUrl = result.imageUrl;
  if (typeof imageUrl !== 'string' || !validateImageUrl(imageUrl.trim())) {
    throw new Error('Le serveur n’a pas retourné une URL d’image valide.');
  }

  return imageUrl.trim();
}
