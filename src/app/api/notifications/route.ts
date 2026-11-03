import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authorizeRequest } from '@/lib/auth/session';
import { handleDatabaseError, parseJson } from '@/lib/api/validation';
import { prisma } from '@/lib/prisma';
import { publishRestaurantEvent } from '@/lib/realtime/event-bus';

const updateNotificationSchema = z.object({
  id: z.string().trim().min(1).max(100),
  isRead: z.boolean(),
});

export async function GET(request: NextRequest) {
  const auth = await authorizeRequest(request, 'ORDERS_READ');
  if (auth.response) return auth.response;

  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { restaurantId: auth.session.restaurantId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          isRead: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({
        where: { restaurantId: auth.session.restaurantId, isRead: false },
      }),
    ]);

    return NextResponse.json({ success: true, data: notifications, unreadCount });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible de charger les notifications.');
  }
}

export async function PATCH(request: NextRequest) {
  const parsed = await parseJson(request, updateNotificationSchema);
  if (!parsed.success) return parsed.response;

  const auth = await authorizeRequest(request, 'ORDERS_UPDATE');
  if (auth.response) return auth.response;

  try {
    const result = await prisma.notification.updateMany({
      where: {
        id: parsed.data.id,
        restaurantId: auth.session.restaurantId,
      },
      data: { isRead: parsed.data.isRead },
    });
    if (result.count !== 1) {
      return NextResponse.json({ error: 'Notification introuvable.' }, { status: 404 });
    }

    publishRestaurantEvent(auth.session.restaurantId, { type: 'notification.updated' });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible de modifier la notification.');
  }
}
