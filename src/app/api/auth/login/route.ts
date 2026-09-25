import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'votre-cle-secrete-par-defaut'
);

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis.' },
        { status: 400 }
      );
    }

    // On inclut ownedRestaurant (pour les propriétaires) ET restaurant (pour le staff)
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        ownedRestaurant: true,
        restaurant: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Identifiants incorrects.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect.' },
        { status: 401 }
      );
    }

    // Récupérer le restaurant selon le rôle (proprio ou staff)
    const activeRestaurant = user.ownedRestaurant || user.restaurant || null;

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      restaurantId: activeRestaurant?.id ?? null,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json(
      {
        message: 'Connexion réussie',
        user: userWithoutPassword,
        restaurant: activeRestaurant,
      },
      { status: 200 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Erreur login:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la connexion.' },
      { status: 500 }
    );
  }
}
