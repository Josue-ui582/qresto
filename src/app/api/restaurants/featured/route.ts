import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isRestaurantOpenNow } from '@/lib/restaurants/opening-hours';

export async function GET() {
  try {
    const [restaurants, reviewAggregates] = await Promise.all([
      prisma.restaurant.findMany({
      take: 3,
      orderBy: [
        { rating: 'desc' },
        { createdAt: 'desc' },
      ],
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
        isOpen: true,
        openingHours: true,
        currency: true,
        deliveryFee: true,
        rating: true,
        reviewCount: true,
        category: true,
        cuisineType: true,
        _count: {
          select: { tables: true },
        },
        tables: {
          select: { number: true },
          orderBy: { number: 'asc' },
        },
      },
      }),
      prisma.review.groupBy({
        by: ['restaurantId'],
        where: { isApproved: true },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

    const aggregatesByRestaurant = new Map(
      reviewAggregates.map((aggregate) => [
        aggregate.restaurantId,
        { rating: aggregate._avg.rating ?? 0, reviewCount: aggregate._count._all },
      ])
    );
    const publicRestaurants = restaurants.map((restaurant) => ({
      ...restaurant,
      isOpen: isRestaurantOpenNow(restaurant.openingHours),
      ...(aggregatesByRestaurant.get(restaurant.id) ?? { rating: 0, reviewCount: 0 }),
    }));

    return NextResponse.json({ restaurants: publicRestaurants }, { status: 200 });
  } catch (error) {
    console.error('Erreur API restaurants certifiés:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des restaurants.' },
      { status: 500 }
    );
  }
}
