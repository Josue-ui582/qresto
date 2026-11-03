import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from 'generated/prisma/client';
import { z } from 'zod';
import { authorizeRequest } from '@/lib/auth/session';
import { handleDatabaseError, parseJson } from '@/lib/api/validation';
import { enforceRateLimit } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { publishRestaurantEvent } from '@/lib/realtime/event-bus';
import { TRACKING_CODE_PATTERN } from '@/lib/orders/tracking-code';
import { canReviewOrder } from '@/lib/reviews/review-policy';
import { cleanReviewText, refreshRestaurantReviewAggregate } from '@/lib/reviews/review-service';

const createReviewSchema = z.object({
  trackingCode: z.string().trim().toUpperCase().regex(TRACKING_CODE_PATTERN),
  customerName: z.string().trim().max(80).optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

const moderateReviewSchema = z.object({
  id: z.string().trim().min(1).max(100),
  isVisible: z.boolean(),
});

const dashboardQuerySchema = z.object({
  restaurantId: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const trackingCodeSchema = z.string().trim().toUpperCase().regex(TRACKING_CODE_PATTERN);

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}

async function getReviewByCode(code: string) {
  return prisma.review.findFirst({
    where: { order: { trackingCode: code } },
    select: { customerName: true, rating: true, comment: true, createdAt: true },
  });
}

export async function GET(request: NextRequest) {
  const searchParams = new URL(request.url).searchParams;
  const publicCode = searchParams.get('code');
  if (publicCode !== null) {
    const parsedCode = trackingCodeSchema.safeParse(publicCode);
    if (!parsedCode.success) {
      return NextResponse.json({ success: true, review: null });
    }
    try {
      const review = await getReviewByCode(parsedCode.data);
      return NextResponse.json({ success: true, review });
    } catch (error: unknown) {
      return handleDatabaseError(error, 'Impossible de vérifier cet avis.');
    }
  }

  const parsedQuery = dashboardQuerySchema.safeParse({
    restaurantId: searchParams.get('restaurantId') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? undefined,
    rating: searchParams.get('rating') ?? undefined,
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
  });
  if (!parsedQuery.success) {
    return NextResponse.json({ error: 'Filtres d’avis invalides.' }, { status: 400 });
  }
  const query = parsedQuery.data;
  const auth = await authorizeRequest(request, 'REVIEWS_ADMIN', query.restaurantId);
  if (auth.response) return auth.response;

  const createdAt: Prisma.DateTimeFilter = {
    ...(query.from ? { gte: new Date(`${query.from}T00:00:00.000Z`) } : {}),
    ...(query.to ? { lte: new Date(`${query.to}T23:59:59.999Z`) } : {}),
  };
  if (query.from && query.to && query.from > query.to) {
    return NextResponse.json({ error: 'La période de filtre est invalide.' }, { status: 400 });
  }
  const filteredWhere: Prisma.ReviewWhereInput = {
    restaurantId: auth.session.restaurantId,
    ...(query.rating ? { rating: query.rating } : {}),
    ...(query.from || query.to ? { createdAt } : {}),
  };

  try {
    const [reviews, total, aggregate, ratings] = await Promise.all([
      prisma.review.findMany({
        where: filteredWhere,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: {
          id: true,
          orderId: true,
          customerName: true,
          rating: true,
          comment: true,
          isVisible: true,
          createdAt: true,
          order: {
            select: {
              trackingCode: true,
              items: { select: { name: true, quantity: true } },
            },
          },
        },
      }),
      prisma.review.count({ where: filteredWhere }),
      prisma.review.aggregate({
        where: { restaurantId: auth.session.restaurantId, isVisible: true },
        _avg: { rating: true },
        _count: { _all: true },
      }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { restaurantId: auth.session.restaurantId, isVisible: true },
        _count: { _all: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        pageCount: Math.ceil(total / query.pageSize),
      },
      summary: {
        averageRating: aggregate._avg.rating ?? 0,
        reviewCount: aggregate._count._all,
        distribution: [1, 2, 3, 4, 5].map((rating) => ({
          rating,
          count: ratings.find((entry) => entry.rating === rating)?._count._all ?? 0,
        })),
      },
    });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible de charger les avis.');
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, 'review-submit', {
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = await parseJson(request, createReviewSchema);
  if (!parsed.success) return parsed.response;

  try {
    const order = await prisma.order.findUnique({
      where: { trackingCode: parsed.data.trackingCode },
      select: {
        id: true,
        restaurantId: true,
        status: true,
        review: { select: { id: true } },
      },
    });
    if (!order) {
      return NextResponse.json({ error: 'Cette commande ne permet pas de déposer un avis.' }, { status: 400 });
    }
    if (order.review) {
      return NextResponse.json({ error: 'Un avis a déjà été déposé pour cette commande.' }, { status: 409 });
    }
    if (!canReviewOrder(order.status, false)) {
      return NextResponse.json({ error: 'Cette commande ne permet pas de déposer un avis.' }, { status: 400 });
    }

    const customerName = parsed.data.customerName
      ? cleanReviewText(parsed.data.customerName).slice(0, 80) || null
      : null;
    const comment = parsed.data.comment
      ? cleanReviewText(parsed.data.comment).slice(0, 1000) || null
      : null;
    const review = await prisma.$transaction(async (transaction) => {
      const createdReview = await transaction.review.create({
        data: {
          orderId: order.id,
          restaurantId: order.restaurantId,
          customerName,
          rating: parsed.data.rating,
          comment,
          isVisible: true,
          isApproved: true,
        },
        select: { customerName: true, rating: true, comment: true, createdAt: true },
      });
      await refreshRestaurantReviewAggregate(transaction, order.restaurantId);
      await transaction.notification.create({
        data: {
          restaurantId: order.restaurantId,
          title: 'Nouvel avis',
          message: `${customerName || 'Un client'} a laissé un avis ${parsed.data.rating}/5.`,
          type: 'NEW_REVIEW',
        },
      });
      return createdReview;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    publishRestaurantEvent(order.restaurantId, { type: 'review.created' });
    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ error: 'Un avis a déjà été déposé pour cette commande.' }, { status: 409 });
    }
    return handleDatabaseError(error, 'Impossible d’enregistrer votre avis.');
  }
}

export async function PUT(request: NextRequest) {
  const parsed = await parseJson(request, moderateReviewSchema);
  if (!parsed.success) return parsed.response;
  const auth = await authorizeRequest(request, 'REVIEWS_ADMIN');
  if (auth.response) return auth.response;

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const existingReview = await transaction.review.findFirst({
        where: { id: parsed.data.id, restaurantId: auth.session.restaurantId },
        select: { id: true, isVisible: true },
      });
      if (!existingReview) return false;

      await transaction.review.updateMany({
        where: { id: existingReview.id, restaurantId: auth.session.restaurantId },
        data: { isVisible: parsed.data.isVisible, isApproved: parsed.data.isVisible },
      });
      await refreshRestaurantReviewAggregate(transaction, auth.session.restaurantId);
      return true;
    });
    if (!result) return NextResponse.json({ error: 'Avis introuvable.' }, { status: 404 });

    publishRestaurantEvent(auth.session.restaurantId, { type: 'review.updated' });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible de modifier la visibilité de cet avis.');
  }
}
