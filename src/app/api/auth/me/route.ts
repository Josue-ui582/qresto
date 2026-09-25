import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'votre-cle-secrete-par-defaut'
);

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedRestaurant: true,
        restaurant: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const { password: _, ...userWithoutPassword } = user;
    const activeRestaurant = user.ownedRestaurant || user.restaurant || null;

    return NextResponse.json(
      {
        user: userWithoutPassword,
        restaurant: activeRestaurant,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur API /me:', error);
    return NextResponse.json(
      { error: 'Session invalide ou expirée' },
      { status: 401 }
    );
  }
}
