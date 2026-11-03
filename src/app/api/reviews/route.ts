import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleDatabaseError, parseJson } from '@/lib/api/validation';
import { enforceRateLimit } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { publishRestaurantEvent } from '@/lib/realtime/event-bus';

const createReviewSchema = z.object({
  restaurantId: z.string().trim().min(1).max(100),
  dishId: z.string().trim().min(1).max(100).optional(),
  customerName: z.string().trim().min(1).max(150),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, 'review-submit', {
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = await parseJson(request, createReviewSchema);
  if (!parsed.success) return parsed.response;

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parsed.data.restaurantId },
      select: { id: true },
    });
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant introuvable.' }, { status: 404 });
    }

    if (parsed.data.dishId) {
      const dish = await prisma.dish.findFirst({
        where: {
          id: parsed.data.dishId,
          restaurantId: restaurant.id,
        },
        select: { id: true },
      });
      if (!dish) {
        return NextResponse.json({ error: 'Plat introuvable dans ce restaurant.' }, { status: 404 });
      }
    }

    const review = await prisma.$transaction(async (transaction) => {
      const createdReview = await transaction.review.create({
        data: {
          restaurantId: restaurant.id,
          dishId: parsed.data.dishId,
          customerName: parsed.data.customerName,
          rating: parsed.data.rating,
          comment: parsed.data.comment || null,
        },
        select: { id: true, rating: true, createdAt: true },
      });
      await transaction.notification.create({
        data: {
          restaurantId: restaurant.id,
          title: 'Nouvel avis client',
          message: `${parsed.data.customerName} a laissé un avis ${parsed.data.rating}/5.`,
          type: 'NEW_REVIEW',
        },
      });
      return createdReview;
    });

    publishRestaurantEvent(restaurant.id, { type: 'review.created' });
    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible d’enregistrer votre avis.');
  }
}
