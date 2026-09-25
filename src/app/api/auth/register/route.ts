import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { slugify } from '@/utils';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'votre-cle-secrete-par-defaut'
);

export async function POST(req: Request) {
  try {
    const { owner, restaurant } = await req.json();

    if (!owner?.email || !owner?.password || !restaurant?.name) {
      return NextResponse.json(
        { error: "Données incomplètes pour l'inscription." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: owner.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà.' },
        { status: 400 }
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
          firstName: owner.firstName,
          lastName: owner.lastName,
          email: owner.email,
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
          email: owner.email,
          subscriptionPlan: restaurant.subscriptionPlan || 'PRO_8000',
          ownerId: newUser.id,
          settings: {
            momoProvider: restaurant.momoProvider,
            momoNumber: restaurant.momoNumber,
          },
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
      .sign(JWT_SECRET);

    const { password: _, ...userWithoutPassword } = result.user;

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
