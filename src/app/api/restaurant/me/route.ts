import { NextRequest, NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/auth/session';
import { handleDatabaseError } from '@/lib/api/validation';
import { prisma } from '@/lib/prisma';

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

    return NextResponse.json({ restaurant }, { status: 200 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors du chargement du restaurant.');
  }
}
