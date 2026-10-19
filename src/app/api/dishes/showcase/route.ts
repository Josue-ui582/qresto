import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError } from '@/lib/api/validation';

export async function GET() {
  try {
    const dishes = await prisma.dish.findMany({
      where: { isAvailable: true },
      take: 24,
      orderBy: [{ isPopular: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        preparationTimeMin: true,
        model3DType: true,
        category: { select: { id: true, name: true } },
        restaurant: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({
      success: true,
      dishes: dishes.map(({ preparationTimeMin, ...dish }) => ({
        ...dish,
        prepTime: `${preparationTimeMin} min`,
      })),
    });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors du chargement des plats à la une.');
  }
}
