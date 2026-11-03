import type { Prisma } from 'generated/prisma/client';

export function cleanReviewText(value: string): string {
  return value
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function refreshRestaurantReviewAggregate(
  transaction: Prisma.TransactionClient,
  restaurantId: string
): Promise<void> {
  const aggregate = await transaction.review.aggregate({
    where: { restaurantId, isVisible: true },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await transaction.restaurant.update({
    where: { id: restaurantId },
    data: {
      rating: aggregate._avg.rating ?? 0,
      reviewCount: aggregate._count._all,
    },
  });
}
