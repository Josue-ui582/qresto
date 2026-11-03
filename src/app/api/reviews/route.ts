import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authorizeRequest } from '@/lib/auth/session';
import { handleDatabaseError, parseJson } from '@/lib/api/validation';
import { enforceRateLimit } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { publishRestaurantEvent } from '@/lib/realtime/event-bus';
import { TRACKING_CODE_PATTERN } from '@/lib/orders/tracking-code';
import { canReviewOrder } from '@/lib/reviews/review-policy';

const createReviewSchema = z.object({
  trackingCode: z.string().trim().toUpperCase().regex(TRACKING_CODE_PATTERN),
  customerName: z.string().trim().min(1).max(150),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});

const moderateReviewSchema = z.object({
  id: z.string().trim().min(1).max(100),
  isApproved: z.boolean(),
});

export async function GET(request: NextRequest) {
  const restaurantId = new URL(request.url).searchParams.get('restaurantId');
  const auth = await authorizeRequest(request, 'REVIEWS_ADMIN', restaurantId);
  if (auth.response) return auth.response;

  try {
    const reviews = await prisma.review.findMany({
      where: { restaurantId: auth.session.restaurantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderId: true,
        customerName: true,
        rating: true,
        comment: true,
        isApproved: true,
        createdAt: true,
        order: { select: { trackingCode: true } },
      },
    });
    return NextResponse.json({ success: true, reviews });
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
    if (!order || !canReviewOrder(order.status, Boolean(order.review))) {
      return NextResponse.json(
        { error: 'Cette commande ne permet pas de déposer un avis.' },
        { status: 400 }
      );
    }

    const review = await prisma.$transaction(async (transaction) => {
      const createdReview = await transaction.review.create({
        data: {
          orderId: order.id,
          restaurantId: order.restaurantId,
          customerName: parsed.data.customerName,
          rating: parsed.data.rating,
          comment: parsed.data.comment || null,
        },
        select: { id: true, rating: true, createdAt: true },
      });
      await transaction.notification.create({
        data: {
          restaurantId: order.restaurantId,
          title: 'Nouvel avis à modérer',
          message: `${parsed.data.customerName} a laissé un avis ${parsed.data.rating}/5.`,
          type: 'NEW_REVIEW',
        },
      });
      return createdReview;
    });

    publishRestaurantEvent(order.restaurantId, { type: 'review.created' });
    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible d’enregistrer votre avis.');
  }
}

export async function PUT(request: NextRequest) {
  const parsed = await parseJson(request, moderateReviewSchema);
  if (!parsed.success) return parsed.response;
  const auth = await authorizeRequest(request, 'REVIEWS_ADMIN');
  if (auth.response) return auth.response;

  try {
    const existingReview = await prisma.review.findFirst({
      where: { id: parsed.data.id, restaurantId: auth.session.restaurantId },
      select: { orderId: true },
    });
    if (!existingReview) {
      return NextResponse.json({ error: 'Avis introuvable.' }, { status: 404 });
    }
    if (parsed.data.isApproved && !existingReview.orderId) {
      return NextResponse.json(
        { error: 'Seuls les avis liés à une commande livrée peuvent être publiés.' },
        { status: 400 }
      );
    }

    const updated = await prisma.review.updateMany({
      where: { id: parsed.data.id, restaurantId: auth.session.restaurantId },
      data: { isApproved: parsed.data.isApproved },
    });
    if (!updated.count) {
      return NextResponse.json({ error: 'Avis introuvable ou modifié simultanément.' }, { status: 409 });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible de modérer cet avis.');
  }
}
