import { NextRequest } from 'next/server';
import { authorizeRequest } from '@/lib/auth/session';
import { subscribeRestaurantEvents } from '@/lib/realtime/event-bus';
import { createSseResponse } from '@/lib/realtime/sse-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 10;

type RouteContext = {
  params: Promise<{ restaurantId: string }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { restaurantId } = await params;
  const auth = await authorizeRequest(request, 'ORDERS_READ', restaurantId);
  if (auth.response) return auth.response;

  return createSseResponse(request, (send) =>
    subscribeRestaurantEvents(auth.session.restaurantId, send)
  );
}
