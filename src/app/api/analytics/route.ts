import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from 'generated/prisma/client';
import { z } from 'zod';
import { authorizeRequest } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    const parsedPeriod = z.enum(['today', '7d', '30d', 'all']).safeParse(period);
    if (!parsedPeriod.success) {
      return NextResponse.json({ error: 'Période invalide.' }, { status: 400 });
    }
    const auth = await authorizeRequest(
      request,
      'ANALYTICS_READ',
      searchParams.get('restaurantId')
    );
    if (auth.response) return auth.response;

    const now = new Date();
    let startDate: Date | undefined;

    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === '7d') {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
    } else if (period === '30d') {
      startDate = new Date();
      startDate.setDate(now.getDate() - 30);
    }

    const whereCondition: Prisma.OrderWhereInput = {
      restaurantId: auth.session.restaurantId,
      ...(startDate ? { createdAt: { gte: startDate } } : {}),
    };

    const [aggregate, ordersByStatusRaw, orderItems, activeTables] = await Promise.all([
      prisma.order.aggregate({
        where: whereCondition,
        _sum: { total: true },
        _count: { id: true },
        _avg: { total: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        where: whereCondition,
        _count: { id: true },
      }),
      prisma.orderItem.findMany({
        where: { order: whereCondition },
        select: { dishId: true, name: true, price: true, quantity: true },
      }),
      prisma.order.findMany({
        where: { ...whereCondition, tableNumber: { not: null } },
        select: { tableNumber: true },
        distinct: ['tableNumber'],
      }),
    ]);

    const itemsByDish = new Map<
      string,
      { id: string; name: string; quantity: number; revenue: number }
    >();

    for (const item of orderItems) {
      const key = item.dishId || item.name;
      const aggregateItem = itemsByDish.get(key) || {
        id: key,
        name: item.name,
        quantity: 0,
        revenue: 0,
      };
      aggregateItem.quantity += item.quantity;
      aggregateItem.revenue += item.price * item.quantity;
      itemsByDish.set(key, aggregateItem);
    }

    const topItems = [...itemsByDish.values()]
      .sort((left, right) => right.quantity - left.quantity)
      .slice(0, 5)
      .map((item) => ({ ...item, category: 'Général' }));

    return NextResponse.json(
      {
        success: true,
        period: parsedPeriod.data,
        stats: {
          totalRevenue: aggregate._sum.total || 0,
          totalOrders: aggregate._count.id,
          averageOrderValue: Math.round(aggregate._avg.total || 0),
          activeTablesCount: activeTables.length,
          ordersByStatus: ordersByStatusRaw.map((item) => ({
            status: item.status,
            count: item._count.id,
          })),
          topItems,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Erreur API GET /api/analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du calcul des statistiques.' },
      { status: 500 }
    );
  }
}
