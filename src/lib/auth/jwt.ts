export class JwtConfigurationError extends Error {
  constructor() {
    super('La variable JWT_SECRET est requise pour les opérations d’authentification.');
    this.name = 'JwtConfigurationError';
  }
}

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new JwtConfigurationError();
  }

  return new TextEncoder().encode(secret);
}
