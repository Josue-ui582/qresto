import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const auth = await authorizeRequest(request, null);
  if (auth.response) return auth.response;

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: auth.session.restaurantId },
    });
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant introuvable.' }, { status: 404 });
    }

    return NextResponse.json(
      { user: auth.session.user, restaurant },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Erreur API /auth/me:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de session.' },
      { status: 500 }
    );
  }
}
