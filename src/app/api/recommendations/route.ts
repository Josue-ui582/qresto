import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError } from '@/lib/api/validation';

const moodSchema = z.string().trim().min(1).max(40);

export async function GET(request: NextRequest) {
  const parsedMood = moodSchema.safeParse(
    new URL(request.url).searchParams.get('mood') ?? 'discovery'
  );
  if (!parsedMood.success) {
    return NextResponse.json({ success: false, error: 'Humeur invalide.' }, { status: 400 });
  }

  try {
    const dishes = await prisma.dish.findMany({
      where: {
        isAvailable: true,
        OR: [{ isSpecialty: true }, { isPopular: true }],
      },
      take: 12,
      orderBy: [{ isSpecialty: 'desc' }, { isPopular: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        isSpecialty: true,
        isPopular: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            currency: true,
          },
        },
      },
    });

    const recommendations = dishes.map((dish) => ({
      title: dish.name,
      description: dish.description,
      mainDish: dish,
      drink: null,
      totalPrice: dish.price,
      currency: dish.restaurant.currency,
      badge: dish.isSpecialty ? 'Spécialité' : 'Populaire',
    }));

    return NextResponse.json({
      success: true,
      mood: parsedMood.data,
      data: recommendations,
    });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors du chargement des recommandations.');
  }
}
