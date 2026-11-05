import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authorizeRequest } from '@/lib/auth/session';
import { handleDatabaseError, parseJson } from '@/lib/api/validation';
import { prisma } from '@/lib/prisma';
import { getInventoryMovementType } from '@/lib/inventory/stock';

const updateInventorySchema = z.object({
  dishId: z.string().trim().min(1).max(100),
  quantity: z.number().int().min(0).max(2_147_483_647),
  lowStockThreshold: z.number().int().min(0).max(2_147_483_647),
});

export async function GET(request: NextRequest) {
  const restaurantId = new URL(request.url).searchParams.get('restaurantId');
  const auth = await authorizeRequest(request, 'INVENTORY_ADMIN', restaurantId);
  if (auth.response) return auth.response;

  try {
    const dishes = await prisma.dish.findMany({
      where: { restaurantId: auth.session.restaurantId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        isAvailable: true,
        stockQuantity: true,
        lowStockThreshold: true,
        inventoryMovements: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, quantityChange: true, type: true, createdAt: true },
        },
      },
    });
    return NextResponse.json({ success: true, dishes });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible de charger l’inventaire.');
  }
}

export async function PUT(request: NextRequest) {
  const parsed = await parseJson(request, updateInventorySchema);
  if (!parsed.success) return parsed.response;
  const auth = await authorizeRequest(request, 'INVENTORY_ADMIN');
  if (auth.response) return auth.response;

  try {
    const updatedDish = await prisma.$transaction(async (transaction) => {
      const dish = await transaction.dish.findFirst({
        where: { id: parsed.data.dishId, restaurantId: auth.session.restaurantId },
        select: { id: true, stockQuantity: true },
      });
      if (!dish) return { error: 'Plat introuvable dans ce restaurant.' as const };

      const changed = await transaction.dish.updateMany({
        where: {
          id: dish.id,
          restaurantId: auth.session.restaurantId,
          stockQuantity: dish.stockQuantity,
        },
        data: {
          stockQuantity: parsed.data.quantity,
          lowStockThreshold: parsed.data.lowStockThreshold,
        },
      });
      if (!changed.count) {
        return { error: 'Le stock a changé simultanément. Rechargez l’inventaire puis réessayez.' as const };
      }

      const quantityChange = parsed.data.quantity - (dish.stockQuantity ?? 0);
      const movementType = getInventoryMovementType(quantityChange);
      if (movementType) {
        await transaction.inventoryMovement.create({
          data: {
            dishId: dish.id,
            quantityChange,
            type: movementType,
          },
        });
      }
      return { dishId: dish.id };
    }, { isolationLevel: 'Serializable' });

    if ('error' in updatedDish) {
      return NextResponse.json({ error: updatedDish.error }, { status: 409 });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible de mettre à jour le stock.');
  }
}
