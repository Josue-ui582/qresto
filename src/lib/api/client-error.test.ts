import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './client-error';

describe('getApiErrorMessage', () => {
  it('uses field-level Zod details instead of the generic API message', () => {
    expect(getApiErrorMessage({
      error: 'Données invalides.',
      details: [{ path: ['email'], message: 'Adresse e-mail invalide' }],
    }, 'Erreur')).toBe('Adresse e-mail : Adresse e-mail invalide');
  });

  it('falls back to the API message or provided message', () => {
    expect(getApiErrorMessage({ error: 'Table introuvable.' }, 'Erreur')).toBe('Table introuvable.');
    expect(getApiErrorMessage({}, 'Erreur')).toBe('Erreur');
  });
});
