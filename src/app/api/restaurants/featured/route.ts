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
      include: {
        _count: {
          select: { tables: true },
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
