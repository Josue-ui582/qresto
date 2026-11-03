import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(20).default(5),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const parsedQuery = querySchema.safeParse({
    page: new URL(request.url).searchParams.get('page') ?? undefined,
    pageSize: new URL(request.url).searchParams.get('pageSize') ?? undefined,
  });
  if (!parsedQuery.success) {
    return NextResponse.json({ error: 'Paramètres de pagination invalides.' }, { status: 400 });
  }
  const { slug } = await params;
  const parsedSlug = z.string().trim().min(1).max(150).safeParse(slug);
  if (!parsedSlug.success) {
    return NextResponse.json({ error: 'Restaurant introuvable.' }, { status: 404 });
  }

  try {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { restaurant: { slug: parsedSlug.data }, isVisible: true },
        orderBy: { createdAt: 'desc' },
        skip: (parsedQuery.data.page - 1) * parsedQuery.data.pageSize,
        take: parsedQuery.data.pageSize,
        select: {
          customerName: true,
          rating: true,
          comment: true,
          createdAt: true,
        },
      }),
      prisma.review.count({
        where: { restaurant: { slug: parsedSlug.data }, isVisible: true },
      }),
    ]);
    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        page: parsedQuery.data.page,
        pageSize: parsedQuery.data.pageSize,
        total,
        pageCount: Math.ceil(total / parsedQuery.data.pageSize),
      },
    });
  } catch (error: unknown) {
    console.error('Erreur lors du chargement des avis publics.', error);
    return NextResponse.json({ error: 'Impossible de charger les avis du restaurant.' }, { status: 500 });
  }
}
