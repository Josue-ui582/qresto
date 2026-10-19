import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { z } from 'zod';
import { getJwtSecret } from '@/lib/auth/jwt';
import { parseJson } from '@/lib/api/validation';

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseJson(req, loginSchema);
    if (!parsed.success) return parsed.response;
    const jwtSecret = getJwtSecret();
    const { email, password } = parsed.data;

    // On inclut ownedRestaurant (pour les propriétaires) ET restaurant (pour le staff)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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
      .sign(jwtSecret);

    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      restaurantId: user.restaurantId,
      createdAt: user.createdAt,
    };

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
