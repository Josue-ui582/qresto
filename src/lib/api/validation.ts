import { NextResponse } from 'next/server';
import { z, type ZodType } from 'zod';

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse };

export async function parseJson<T>(
  request: Request,
  schema: ZodType<T>
): Promise<ValidationResult<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      response: NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 }),
    };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Données invalides.', details: parsed.error.issues },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: parsed.data };
}

export function parseQueryParam(
  value: string | null,
  label: string,
  maxLength = 100
): ValidationResult<string | null> {
  if (value === null) return { success: true, data: null };

  const parsed = z.string().trim().min(1).max(maxLength).safeParse(value);
  if (!parsed.success) {
    return {
      success: false,
      response: NextResponse.json(
        { error: `${label} invalide.`, details: parsed.error.issues },
        { status: 400 }
      ),
    };
  }
  return { success: true, data: parsed.data };
}

export function handleDatabaseError(error: unknown, message: string): NextResponse {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2025'
  ) {
    return NextResponse.json({ error: 'Ressource introuvable.' }, { status: 404 });
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  ) {
    return NextResponse.json({ error: 'Cette ressource existe déjà.' }, { status: 409 });
  }

  console.error(message, error);
  return NextResponse.json({ error: message }, { status: 500 });
}
