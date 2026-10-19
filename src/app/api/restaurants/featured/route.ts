import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
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
    });

    return NextResponse.json({ restaurants }, { status: 200 });
  } catch (error) {
    console.error('Erreur API restaurants certifiés:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des restaurants.' },
      { status: 500 }
    );
  }
}
