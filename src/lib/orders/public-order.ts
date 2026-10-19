import { prisma } from '@/lib/prisma';

export async function findPublicTrackedOrder(code: string) {
  const order = await prisma.order.findUnique({
    where: { trackingCode: code.trim().toUpperCase() },
    select: {
      trackingCode: true,
      restaurantName: true,
      status: true,
      total: true,
      items: { select: { name: true, price: true, quantity: true } },
      statusHistory: {
        select: { status: true, timestamp: true, comment: true },
        orderBy: { timestamp: 'asc' },
      },
    },
  });

  if (!order) return null;
  return {
    ...order,
    statusHistory: order.statusHistory.map(({ status, timestamp, comment }) => ({
      status,
      timestamp,
      note: comment,
    })),
  };
}
