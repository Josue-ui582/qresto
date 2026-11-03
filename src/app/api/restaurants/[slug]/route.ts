import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isRestaurantOpenNow } from '@/lib/restaurants/opening-hours';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // 1. Déballer params avec await (Requis sur Next.js 15+)
    const { slug: identifier } = await params;
    const parsedIdentifier = z.string().trim().min(1).max(150).safeParse(identifier);
    if (!parsedIdentifier.success) {
      return NextResponse.json(
        { error: 'Identifiant de restaurant invalide.' },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { slug: parsedIdentifier.data },
          { id: parsedIdentifier.data },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        city: true,
        phone: true,
        logo: true,
        coverImage: true,
        openingHours: true,
        isOpen: true,
        currency: true,
        deliveryFee: true,
        minOrder: true,
        rating: true,
        reviewCount: true,
        category: true,
        cuisineType: true,
        categories: {
          select: {
            id: true,
            restaurantId: true,
            name: true,
            description: true,
            order: true,
            active: true,
            dishes: {
              select: {
                id: true,
                categoryId: true,
                name: true,
                slug: true,
                description: true,
                price: true,
                originalPrice: true,
                image: true,
                isAvailable: true,
                preparationTimeMin: true,
                allergens: true,
                isPopular: true,
                isChefSpecial: true,
                isSpecialty: true,
                has3DModel: true,
                model3DType: true,
                createdAt: true,
                optionGroups: {
                  select: {
                    id: true,
                    name: true,
                    isRequired: true,
                    minSelection: true,
                    maxSelection: true,
                    options: {
                      where: { available: true },
                      select: { id: true, name: true, price: true, available: true },
                    },
                  },
                },
              },
              where: { isAvailable: true },
            },
          },
          where: { active: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant introuvable.' },
        { status: 404 }
      );
    }

    const reviewAggregate = await prisma.review.aggregate({
      where: { restaurantId: restaurant.id },
      _avg: { rating: true },
      _count: { _all: true },
    });
    return NextResponse.json({
      restaurant: {
        ...restaurant,
        isOpen: isRestaurantOpenNow(restaurant.openingHours),
        rating: reviewAggregate._avg.rating ?? 0,
        reviewCount: reviewAggregate._count._all,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur API /api/restaurants/[slug]:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du restaurant.' },
      { status: 500 }
    );
  }
}
