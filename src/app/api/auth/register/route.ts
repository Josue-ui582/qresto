import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { slugify } from '@/utils';
import { z } from 'zod';
import { getJwtSecret } from '@/lib/auth/jwt';
import { parseJson } from '@/lib/api/validation';

const registerSchema = z.object({
  owner: z.object({
    email: z.string().trim().email().max(254),
    password: z.string().min(6).max(200),
    fullName: z.string().trim().min(1).max(150),
    phone: z.string().trim().min(8).max(30),
  }),
  restaurant: z.object({
    name: z.string().trim().min(1).max(150),
    address: z.string().trim().min(1).max(500),
    city: z.string().trim().max(100).optional(),
    category: z.string().trim().max(100).optional(),
    description: z.string().trim().max(2000).optional(),
    logo: z.string().max(2048).optional(),
    coverImage: z.string().max(2048).optional(),
  }),
});

export async function POST(req: Request) {
  try {
    const parsed = await parseJson(req, registerSchema);
    if (!parsed.success) return parsed.response;
    const jwtSecret = getJwtSecret();
    const { owner, restaurant } = parsed.data;
    const fullName = owner.fullName.trim();
    const nameParts = fullName.split(/\s+/).filter(Boolean);

    if (!nameParts.length) {
      return NextResponse.json(
        { error: "Données incomplètes pour l'inscription." },
        { status: 400 }
      );
    }

    const email = owner.email.toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(owner.password, 10);

    let baseSlug = slugify(restaurant.name);
    const existingSlug = await prisma.restaurant.findUnique({
      where: { slug: baseSlug },
    });

    if (existingSlug) {
      baseSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Transaction : Utilisateur puis Restaurant lié via ownerId
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' '),
          email,
          phone: owner.phone,
          password: hashedPassword,
          role: 'RESTAURANT_OWNER',
        },
      });

      const newRestaurant = await tx.restaurant.create({
        data: {
          name: restaurant.name,
          slug: baseSlug,
          city: restaurant.city || 'Cotonou',
          address: restaurant.address || '',
          category: restaurant.category,
          description: restaurant.description,
          logo: restaurant.logo,
          coverImage: restaurant.coverImage,
          phone: owner.phone,
          email,
          ownerId: newUser.id,
        },
      });

      return { user: newUser, restaurant: newRestaurant };
    });

    const token = await new SignJWT({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      restaurantId: result.restaurant.id,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(jwtSecret);

    const userWithoutPassword = {
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      phone: result.user.phone,
      role: result.user.role,
      restaurantId: result.user.restaurantId,
      createdAt: result.user.createdAt,
    };

    const response = NextResponse.json(
      {
        message: 'Création réussie',
        user: userWithoutPassword,
        restaurant: result.restaurant,
      },
      { status: 201 }
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
    console.error('Erreur inscription backend:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création du restaurant.' },
      { status: 500 }
    );
  }
}
