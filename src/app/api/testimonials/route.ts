import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError } from '@/lib/api/validation';

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
        role: true,
        restaurantName: true,
        city: true,
        avatar: true,
        rating: true,
        text: true,
      },
    });

    return NextResponse.json({ testimonials });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors du chargement des témoignages.');
  }
}
