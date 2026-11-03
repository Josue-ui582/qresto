import { getApiErrorMessage, getApiFieldErrors, isApiSuccess } from '@/lib/api/client-error';
import { validateImageUrl } from '@/lib/uploads/image-validation';

export class DishSubmissionError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Record<string, string> = {}
  ) {
    super(message);
    this.name = 'DishSubmissionError';
  }
}

export async function submitDish(
  payload: Record<string, unknown>,
  editingDishId?: string
): Promise<void> {
  const imageUrl = typeof payload.imageUrl === 'string' ? payload.imageUrl.trim() : '';
  if (!imageUrl || !validateImageUrl(imageUrl)) {
    throw new DishSubmissionError(
      imageUrl.toLowerCase().startsWith('data:')
        ? 'L’image n’a pas été téléversée. Sélectionnez à nouveau le fichier.'
        : 'Choisissez une URL d’image valide ou téléversez un fichier.',
      { imageUrl: 'Une URL valide ou une image téléversée est requise.' }
    );
  }

  let response: Response;
  try {
    response = await fetch('/api/dishes', {
      method: editingDishId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, imageUrl }),
    });
  } catch {
    throw new DishSubmissionError('Erreur réseau : impossible d’enregistrer le plat.');
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new DishSubmissionError('Réponse invalide du serveur lors de l’enregistrement du plat.');
  }

  if (!response.ok || !isApiSuccess(result)) {
    const message = response.status === 401
      ? 'Votre session a expiré. Reconnectez-vous puis réessayez.'
      : getApiErrorMessage(result, 'Erreur lors de la sauvegarde du plat.');
    throw new DishSubmissionError(message, getApiFieldErrors(result));
  }
}
