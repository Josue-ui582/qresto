import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from 'generated/prisma/client';
import { z } from 'zod';
import { authorizeRequest } from '@/lib/auth/session';
import { handleDatabaseError } from '@/lib/api/validation';
import { prisma } from '@/lib/prisma';
import { getAnalyticsDateRange, isValidTimeZone } from '@/lib/analytics/analytics-period';

const DEFAULT_TIME_ZONE = 'Africa/Porto-Novo';
const querySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'custom']).default('week'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeZone: z.string().min(1).max(100).default(DEFAULT_TIME_ZONE),
  restaurantId: z.string().optional(),
});

interface TopSellingDish {
  id: string;
  name: string;
  category: string;
  quantity: number;
  revenue: number;
}

interface PeakHour {
  hour: number;
  count: number;
}

export async function GET(request: NextRequest) {
  const searchParams = new URL(request.url).searchParams;
  const parsed = querySchema.safeParse({
    period: searchParams.get('period') ?? undefined,
    startDate: searchParams.get('startDate') ?? undefined,
    endDate: searchParams.get('endDate') ?? undefined,
    timeZone: searchParams.get('timeZone') ?? undefined,
    restaurantId: searchParams.get('restaurantId') ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Paramètres analytics invalides.' }, { status: 400 });
  }

  const auth = await authorizeRequest(
    request,
    'ANALYTICS_READ',
    parsed.data.restaurantId
  );
  if (auth.response) return auth.response;

  const { period, startDate, endDate, timeZone } = parsed.data;
  if (!isValidTimeZone(timeZone)) {
    return NextResponse.json({ error: 'Fuseau horaire invalide.' }, { status: 400 });
  }

  const range = getAnalyticsDateRange(period, timeZone, new Date(), startDate, endDate);
  if (!range) {
    return NextResponse.json(
      { error: period === 'custom' ? 'Période personnalisée invalide.' : 'Période invalide.' },
      { status: 400 }
    );
  }

  const where: Prisma.OrderWhereInput = {
    restaurantId: auth.session.restaurantId,
    createdAt: { gte: range.startDate, lt: range.endDate },
  };
  const nonCancelledWhere: Prisma.OrderWhereInput = {
    ...where,
    status: { not: 'CANCELLED' },
  };
  const timeSql = Prisma.sql`AND o."createdAt" >= ${range.startDate} AND o."createdAt" < ${range.endDate}`;

  try {
    const [
      aggregate,
      ordersByStatus,
      ordersByType,
      topItems,
      peakHours,
      activeTables,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: nonCancelledWhere,
        _sum: { total: true },
        _count: { id: true },
        _avg: { total: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
        orderBy: { status: 'asc' },
      }),
      prisma.order.groupBy({
        by: ['type'],
        where,
        _count: { id: true },
        orderBy: { type: 'asc' },
      }),
      prisma.$queryRaw<TopSellingDish[]>(Prisma.sql`
        SELECT
          COALESCE(d.id, oi.name) AS id,
          COALESCE(d.name, oi.name) AS name,
          COALESCE(c.name, 'Général') AS category,
          SUM(oi.quantity)::int AS quantity,
          SUM(oi.price * oi.quantity)::int AS revenue
        FROM order_items oi
        INNER JOIN orders o ON o.id = oi."orderId"
        LEFT JOIN dishes d ON d.id = oi."dishId"
        LEFT JOIN categories c ON c.id = d."categoryId"
        WHERE o."restaurantId" = ${auth.session.restaurantId}
          ${timeSql}
          AND o.status <> 'CANCELLED'
        GROUP BY
          COALESCE(d.id, oi.name),
          COALESCE(d.name, oi.name),
          COALESCE(c.name, 'Général')
        ORDER BY quantity DESC, revenue DESC
        LIMIT 5
      `),
      prisma.$queryRaw<PeakHour[]>(Prisma.sql`
        SELECT EXTRACT(HOUR FROM (o."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${timeZone}))::int AS hour,
          COUNT(*)::int AS count
        FROM orders o
        WHERE o."restaurantId" = ${auth.session.restaurantId}
          ${timeSql}
          AND o.status <> 'CANCELLED'
        GROUP BY hour
        ORDER BY count DESC, hour ASC
      `),
      prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
        SELECT COUNT(DISTINCT o."tableNumber")::int AS count
        FROM orders o
        WHERE o."restaurantId" = ${auth.session.restaurantId}
          ${timeSql}
          AND o."tableNumber" IS NOT NULL
          AND o.status <> 'CANCELLED'
      `),
    ]);

    return NextResponse.json({
      success: true,
      period,
      timeZone,
      range: {
        startDate: range.startDate.toISOString(),
        endDate: range.endDate.toISOString(),
      },
      stats: {
        totalRevenue: aggregate._sum.total ?? 0,
        totalOrders: aggregate._count.id,
        averageOrderValue: Math.round(aggregate._avg.total ?? 0),
        activeTablesCount: activeTables[0]?.count ?? 0,
        ordersByStatus: ordersByStatus.map(({ status, _count }) => ({
          status,
          count: _count.id,
        })),
        ordersByType: ordersByType.map(({ type, _count }) => ({
          type,
          count: _count.id,
        })),
        topItems,
        peakHours,
      },
    });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors du calcul des statistiques.');
  }
}
