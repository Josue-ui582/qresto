import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    (await cookies()).delete('auth_token');

    return NextResponse.json(
      { message: 'Déconnexion réussie' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur suppression cookie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}
