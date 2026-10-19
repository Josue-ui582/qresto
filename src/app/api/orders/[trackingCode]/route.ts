import { NextRequest, NextResponse } from 'next/server';
import { OrderStatus } from 'generated/prisma/enums';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/auth/session';
import { handleDatabaseError, parseJson } from '@/lib/api/validation';
import { enforceRateLimit } from '@/lib/rate-limit';
import { findPublicTrackedOrder } from '@/lib/orders/public-order';

const routeCodeSchema = z.string().trim().regex(/^QR-(?:\d{4}|[A-F0-9]{12})$/i);
const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

type TrackingRouteContext = {
  params: Promise<{ trackingCode: string }>;
};

export async function GET(request: NextRequest, { params }: TrackingRouteContext) {
  const rateLimitResponse = enforceRateLimit(request, 'order-tracking', {
    limit: 180,
    windowMs: 15 * 60 * 1000,
  });
  if (rateLimitResponse) return rateLimitResponse;

  const { trackingCode } = await params;
  const parsedCode = routeCodeSchema.safeParse(trackingCode);
  if (!parsedCode.success) {
    return NextResponse.json({ error: 'Code de suivi invalide.' }, { status: 400 });
  }

  try {
    const order = await findPublicTrackedOrder(parsedCode.data);
    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors de la récupération de la commande.');
  }
}

export async function PATCH(request: NextRequest, { params }: TrackingRouteContext) {
  const parsed = await parseJson(request, updateStatusSchema);
  if (!parsed.success) return parsed.response;
  const auth = await authorizeRequest(request, 'ORDERS_UPDATE');
  if (auth.response) return auth.response;

  const { trackingCode } = await params;
  const parsedIdentifier = z.string().trim().min(1).max(100).safeParse(trackingCode);
  if (!parsedIdentifier.success) {
    return NextResponse.json({ error: 'Identifiant de commande invalide.' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        restaurantId: auth.session.restaurantId,
        OR: [
          { id: parsedIdentifier.data },
          { trackingCode: parsedIdentifier.data.toUpperCase() },
        ],
      },
      select: { id: true },
    });
    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: parsed.data.status,
        statusHistory: {
          create: {
            status: parsed.data.status,
            comment: `Statut mis à jour vers : ${parsed.data.status}`,
          },
        },
      },
      include: { items: true, statusHistory: true },
    });

    return NextResponse.json(
      { success: true, message: 'Statut mis à jour avec succès.', data: updatedOrder },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur serveur lors de la mise à jour du statut.');
  }
}
