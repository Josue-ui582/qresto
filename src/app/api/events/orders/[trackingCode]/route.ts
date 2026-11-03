import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError } from '@/lib/api/validation';
import { enforceRateLimit } from '@/lib/rate-limit';
import { TRACKING_CODE_PATTERN } from '@/lib/orders/tracking-code';
import { subscribeOrderEvents } from '@/lib/realtime/event-bus';
import { createSseResponse } from '@/lib/realtime/sse-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const trackingCodeSchema = z.string().trim().regex(TRACKING_CODE_PATTERN);

type RouteContext = {
  params: Promise<{ trackingCode: string }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const rateLimitResponse = enforceRateLimit(request, 'order-tracking-stream', {
    limit: 180,
    windowMs: 15 * 60 * 1000,
  });
  if (rateLimitResponse) return rateLimitResponse;

  const { trackingCode } = await params;
  const parsedCode = trackingCodeSchema.safeParse(trackingCode);
  if (!parsedCode.success) {
    return NextResponse.json({ error: 'Code de suivi invalide.' }, { status: 400 });
  }

  try {
    const normalizedCode = parsedCode.data.toUpperCase();
    const order = await prisma.order.findUnique({
      where: { trackingCode: normalizedCode },
      select: { restaurantId: true },
    });
    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    }

    return createSseResponse(request, (send) =>
      subscribeOrderEvents(normalizedCode, send)
    );
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible d’ouvrir le suivi en temps réel.');
  }
}
