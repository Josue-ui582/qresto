const fieldLabels: Record<string, string> = {
  name: 'Nom',
  description: 'Description',
  sortOrder: 'Ordre d’affichage',
  number: 'Numéro',
  capacity: 'Capacité',
  email: 'Adresse e-mail',
  phone: 'Téléphone',
  role: 'Rôle',
  pinCode: 'Code PIN',
  isActive: 'Statut',
  imageUrl: 'Image',
  price: 'Prix',
  categoryId: 'Catégorie',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isApiSuccess(payload: unknown): payload is { success: true } {
  return isRecord(payload) && payload.success === true;
}

export function getApiFieldErrors(payload: unknown): Record<string, string> {
  if (!isRecord(payload) || !Array.isArray(payload.details)) return {};

  const fieldErrors: Record<string, string> = {};
  for (const detail of payload.details) {
    if (!isRecord(detail) || typeof detail.message !== 'string' || !Array.isArray(detail.path)) continue;
    const field = detail.path.find((part): part is string => typeof part === 'string');
    if (field && !fieldErrors[field]) fieldErrors[field] = detail.message;
  }
  return fieldErrors;
}

export function getApiErrorMessage(payload: unknown, fallback: string): string {
  if (!isRecord(payload)) return fallback;

  const details = Array.isArray(payload.details) ? payload.details : [];
  const validationMessages = details.flatMap((detail) => {
    if (!isRecord(detail) || typeof detail.message !== 'string') return [];
    const path = Array.isArray(detail.path)
      ? detail.path.filter((part): part is string | number => typeof part === 'string' || typeof part === 'number')
      : [];
    const key = path.length ? String(path[path.length - 1]) : '';
    const label = fieldLabels[key] || (key ? key.replace(/([a-z])([A-Z])/g, '$1 $2') : 'Valeur');
    return [`${label} : ${detail.message}`];
  });
  if (validationMessages.length) return validationMessages.slice(0, 3).join(' · ');

  return typeof payload.error === 'string' && payload.error.trim()
    ? payload.error
    : fallback;
}
