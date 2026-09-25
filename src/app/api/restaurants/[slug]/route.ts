import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // 1. Déballer params avec await (Requis sur Next.js 15+)
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Le slug du restaurant est requis.' },
        { status: 400 }
      );
    }

    // 2. Recherche en BDD avec le slug récupéré
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      include: {
        categories: {
          where: { active: true },
          orderBy: { order: 'asc' },
          include: {
            dishes: {
              where: { isAvailable: true },
            },
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant introuvable.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ restaurant }, { status: 200 });
  } catch (error) {
    console.error('Erreur API /api/restaurants/[slug]:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du restaurant.' },
      { status: 500 }
    );
  }
}
