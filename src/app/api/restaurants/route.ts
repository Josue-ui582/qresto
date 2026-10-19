import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      orderBy: {
        createdAt: 'desc',
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
        createdAt: true,
      },
    });

    return NextResponse.json({ restaurants }, { status: 200 });
  } catch (error) {
    console.error('Erreur API /api/restaurants:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des restaurants.' },
      { status: 500 }
    );
  }
}
