import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // 1. Déballer params avec await (Requis sur Next.js 15+)
    const { slug } = await params;
    const parsedSlug = z.string().trim().min(1).max(150).regex(/^[a-z0-9-]+$/i).safeParse(slug);
    if (!parsedSlug.success) {
      return NextResponse.json(
        { error: 'Identifiant de restaurant invalide.' },
        { status: 400 }
      );
    }

    // 2. Recherche en BDD avec le slug récupéré
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: parsedSlug.data },
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

    return NextResponse.json({ restaurant }, { status: 200 });
  } catch (error) {
    console.error('Erreur API /api/restaurants/[slug]:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du restaurant.' },
      { status: 500 }
    );
  }
}
