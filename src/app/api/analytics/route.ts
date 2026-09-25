import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const period = searchParams.get('period') || '7d'; // 'today' | '7d' | '30d' | 'all'

    // Filtrage par date
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

    const whereCondition: any = {};
    if (restaurantId) whereCondition.restaurantId = restaurantId;
    if (startDate) whereCondition.createdAt = { gte: startDate };

    // 1. Statistiques globales
    const aggregate = await prisma.order.aggregate({
      where: whereCondition,
      _sum: { totalAmount: true },
      _count: { id: true },
      _avg: { totalAmount: true },
    });

    const totalRevenue = aggregate._sum.totalAmount || 0;
    const totalOrders = aggregate._count.id || 0;
    const averageOrderValue = Math.round(aggregate._avg.totalAmount || 0);

    // 2. Commandes par statut
    const ordersByStatusRaw = await prisma.order.groupBy({
      by: ['status'],
      where: whereCondition,
      _count: { id: true },
    });

    const ordersByStatus = ordersByStatusRaw.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

    // 3. Plats les plus vendus (Top 5)
    const topItemsRaw = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: {
        order: whereCondition,
      },
      _sum: { quantity: true, price: true },
      _count: { id: true },
      orderBy: {
        _sum: { quantity: 'desc' },
      },
      take: 5,
    });

    // Enrichir avec le nom du plat
    const topItems = await Promise.all(
      topItemsRaw.map(async (item) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
          select: { name: true, category: { select: { name: true } } },
        });
        return {
          id: item.menuItemId,
          name: menuItem?.name || 'Article inconnu',
          category: menuItem?.category?.name || 'Général',
          quantity: item._sum.quantity || 0,
          revenue: (item._sum.price || 0) * (item._sum.quantity || 1),
        };
      })
    );

    // 4. Nombre de tables actives (ayant passé au moins 1 commande sur la période)
    const activeTablesRaw = await prisma.order.groupBy({
      by: ['tableNumber'],
      where: whereCondition,
    });

    return NextResponse.json(
      {
        success: true,
        period,
        stats: {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          activeTablesCount: activeTablesRaw.length,
          ordersByStatus,
          topItems,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur API GET /api/analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du calcul des statistiques.' },
      { status: 500 }
    );
  }
}
