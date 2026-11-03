import { prisma } from '@/lib/prisma';

export async function findPublicTrackedOrder(code: string) {
  const order = await prisma.order.findUnique({
    where: { trackingCode: code.trim().toUpperCase() },
    select: {
      trackingCode: true,
      restaurantName: true,
      restaurantPhone: true,
      restaurant: { select: { currency: true } },
      status: true,
      total: true,
      customerName: true,
      review: { select: { id: true } },
      items: { select: { name: true, price: true, quantity: true } },
      statusHistory: {
        select: { status: true, timestamp: true, comment: true },
        orderBy: { timestamp: 'asc' },
      },
    },
  });

  if (!order) return null;
  const { restaurant, review, ...publicOrder } = order;
  return {
    ...publicOrder,
    currency: restaurant.currency,
    hasReview: Boolean(review),
    statusHistory: publicOrder.statusHistory.map(({ status, timestamp, comment }) => ({
      status,
      timestamp,
      note: comment,
    })),
  };
}
