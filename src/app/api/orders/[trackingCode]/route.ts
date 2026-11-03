import { NextRequest, NextResponse } from 'next/server';
import { OrderStatus } from 'generated/prisma/enums';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/auth/session';
import { handleDatabaseError, parseJson } from '@/lib/api/validation';
import { enforceRateLimit } from '@/lib/rate-limit';
import { findPublicTrackedOrder } from '@/lib/orders/public-order';
import { TRACKING_CODE_PATTERN } from '@/lib/orders/tracking-code';
import { canTransitionOrderStatus } from '@/lib/orders/order-status';

const routeCodeSchema = z.string().trim().regex(TRACKING_CODE_PATTERN);
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
    const result = await prisma.$transaction(async (transaction) => {
      const order = await transaction.order.findFirst({
        where: {
          restaurantId: auth.session.restaurantId,
          OR: [
            { id: parsedIdentifier.data },
            { trackingCode: parsedIdentifier.data.toUpperCase() },
          ],
        },
        select: { id: true, status: true },
      });
      if (!order) return { kind: 'not-found' as const };
      if (!canTransitionOrderStatus(order.status, parsed.data.status)) {
        return { kind: 'invalid-transition' as const };
      }

      const update = await transaction.order.updateMany({
        where: {
          id: order.id,
          restaurantId: auth.session.restaurantId,
          status: order.status,
        },
        data: { status: parsed.data.status },
      });
      if (update.count !== 1) return { kind: 'conflict' as const };

      await transaction.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: parsed.data.status,
          comment: `Statut mis à jour vers : ${parsed.data.status}`,
        },
      });
      const updatedOrder = await transaction.order.findUnique({
        where: { id: order.id },
        include: { items: true, statusHistory: true },
      });
      if (!updatedOrder) throw new Error('La commande modifiée est introuvable.');
      return { kind: 'updated' as const, order: updatedOrder };
    });

    if (result.kind === 'not-found') {
      return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    }
    if (result.kind === 'invalid-transition') {
      return NextResponse.json(
        { error: 'Cette transition de statut n’est pas autorisée.' },
        { status: 409 }
      );
    }
    if (result.kind === 'conflict') {
      return NextResponse.json(
        { error: 'Le statut a changé entre-temps. Actualisez la commande.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Statut mis à jour avec succès.', data: result.order },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur serveur lors de la mise à jour du statut.');
  }
}
