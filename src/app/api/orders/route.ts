import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from 'generated/prisma/client';
import { OrderStatus, OrderType, PaymentMethod, PaymentStatus } from 'generated/prisma/enums';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/auth/session';
import { handleDatabaseError, parseJson } from '@/lib/api/validation';
import { enforceRateLimit } from '@/lib/rate-limit';
import { findPublicTrackedOrder } from '@/lib/orders/public-order';
import { calculateOrderTotals, resolveSelectedDishOptions } from '@/lib/orders/order-pricing';
import { isE164WhatsappPhone } from '@/lib/orders/whatsapp-phone';
import { generateTrackingCode, TRACKING_CODE_PATTERN } from '@/lib/orders/tracking-code';
import { notifyOrderCreated } from '@/lib/orders/order-notifier';

const createOrderSchema = z.object({
  restaurantId: z.string().min(1),
  type: z.nativeEnum(OrderType).default(OrderType.DINE_IN),
  tableNumber: z.union([z.string().trim().min(1).max(30), z.number().int().positive()]).optional(),
  customerName: z.string().trim().min(1).max(150),
  customerWhatsapp: z.string().trim().refine(
    isE164WhatsappPhone,
    'Un numéro WhatsApp valide au format E.164 est requis.'
  ),
  whatsappConsent: z.literal(true),
  customerAddress: z.string().trim().max(500).optional(),
  customerNotes: z.string().trim().max(1000).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH_ON_DELIVERY),
  items: z.array(z.object({
    dishId: z.string().min(1),
    quantity: z.number().int().min(1).max(100),
    notes: z.string().trim().max(500).optional(),
    optionIds: z.array(z.string().min(1).max(100)).max(30).default([]),
  })).min(1).max(50).superRefine((items, context) => {
    if (new Set(items.map((item) => item.dishId)).size !== items.length) {
      context.addIssue({
        code: 'custom',
        message: 'Chaque plat doit apparaître une seule fois dans la commande.',
      });
    }
  }),
}).superRefine((value, context) => {
  if (value.type === OrderType.DINE_IN && !value.tableNumber) {
    context.addIssue({
      code: 'custom',
      path: ['tableNumber'],
      message: 'Le numéro de table est requis pour une commande sur place.',
    });
  }
  if (value.type === OrderType.DELIVERY && !value.customerAddress) {
    context.addIssue({
      code: 'custom',
      path: ['customerAddress'],
      message: 'L’adresse de livraison est requise.',
    });
  }
});

const trackingCodeSchema = z.string().trim().regex(TRACKING_CODE_PATTERN);

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, 'order-create', {
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = await parseJson(request, createOrderSchema);
  if (!parsed.success) return parsed.response;

  try {
    const input = parsed.data;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: input.restaurantId },
      select: { id: true, name: true, phone: true, deliveryFee: true },
    });
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant introuvable.' }, { status: 404 });
    }

    let verifiedTableNumber: string | null = null;
    if (input.type === OrderType.DINE_IN) {
      const requestedTableNumber = String(input.tableNumber);
      const table = await prisma.restaurantTable.findFirst({
        where: {
          restaurantId: restaurant.id,
          number: requestedTableNumber,
          active: true,
        },
        select: { number: true },
      });
      if (!table) {
        return NextResponse.json(
          { error: 'La table indiquée est indisponible dans ce restaurant.' },
          { status: 400 }
        );
      }
      verifiedTableNumber = table.number;
    }

    const dishIds = [...new Set(input.items.map((item) => item.dishId))];
    const dishes = await prisma.dish.findMany({
      where: {
        id: { in: dishIds },
        restaurantId: restaurant.id,
        isAvailable: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        optionGroups: {
          select: {
            id: true,
            minSelection: true,
            maxSelection: true,
            isRequired: true,
            options: {
              select: { id: true, name: true, price: true, available: true },
            },
          },
        },
      },
    });
    const dishesById = new Map(dishes.map((dish) => [dish.id, dish]));
    if (dishesById.size !== dishIds.length) {
      return NextResponse.json(
        { error: 'Un ou plusieurs plats ne sont plus disponibles.' },
        { status: 400 }
      );
    }

    const items: Array<{
      dish: (typeof dishes)[number];
      quantity: number;
      notes?: string;
      selectedOptions: NonNullable<ReturnType<typeof resolveSelectedDishOptions>>;
      unitPrice: number;
    }> = [];
    for (const item of input.items) {
      const dish = dishesById.get(item.dishId);
      if (!dish) {
        return NextResponse.json({ error: 'Un ou plusieurs plats ne sont plus disponibles.' }, { status: 400 });
      }

      const selectedOptions = resolveSelectedDishOptions(dish.optionGroups, item.optionIds);
      if (!selectedOptions) {
        return NextResponse.json({ error: 'Les options sélectionnées ne sont pas valides.' }, { status: 400 });
      }
      items.push({
        ...item,
        dish,
        selectedOptions,
        unitPrice: dish.price + selectedOptions.reduce((sum, option) => sum + option.price, 0),
      });
    }
    const deliveryFee = input.type === OrderType.DELIVERY ? restaurant.deliveryFee : 0;
    const totals = calculateOrderTotals(
      items.map(({ unitPrice, quantity }) => ({ unitPrice, quantity })),
      deliveryFee
    );
    if (!totals) {
      return NextResponse.json({ error: 'Le montant de la commande est invalide.' }, { status: 400 });
    }
    const { subtotal, total } = totals;

    const trackingCode = generateTrackingCode();
    const newOrder = await prisma.$transaction(async (transaction) => {
      const order = await transaction.order.create({
        data: {
          trackingCode,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          restaurantPhone: restaurant.phone,
          type: input.type,
          tableNumber: verifiedTableNumber,
          subtotal,
          deliveryFee,
          total,
          status: OrderStatus.NEW,
          customerName: input.customerName,
          customerPhone: input.customerWhatsapp,
          customerWhatsapp: input.customerWhatsapp,
          whatsappConsent: input.whatsappConsent,
          customerAddress: input.type === OrderType.DELIVERY ? input.customerAddress : null,
          customerNotes: input.customerNotes || null,
          paymentMethod: input.paymentMethod,
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      await transaction.orderItem.createMany({
        data: items.map((item) => ({
          orderId: order.id,
          dishId: item.dish.id,
          name: item.dish.name,
          price: item.unitPrice,
          quantity: item.quantity,
          notes: item.notes || null,
          options: item.selectedOptions.map((option): Prisma.InputJsonObject => ({
            id: option.id,
            name: option.name,
            price: option.price,
          })),
        })),
      });
      await transaction.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.NEW,
          comment: 'Commande enregistrée',
        },
      });

      return order;
    });

    try {
      await notifyOrderCreated({
        id: newOrder.id,
        trackingCode: newOrder.trackingCode,
        restaurantId: newOrder.restaurantId,
      });
    } catch (error: unknown) {
      console.error('Échec de la notification après création de commande.', error);
    }

    const publicOrder = await findPublicTrackedOrder(newOrder.trackingCode);
    if (!publicOrder) {
      throw new Error('La commande créée est introuvable lors de la préparation de sa réponse.');
    }
    return NextResponse.json(
      { success: true, message: 'Commande enregistrée avec succès.', data: publicOrder },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur serveur lors de la création de la commande.');
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.has('trackingCode')) {
    const rateLimitResponse = enforceRateLimit(request, 'order-tracking', {
      limit: 180,
      windowMs: 15 * 60 * 1000,
    });
    if (rateLimitResponse) return rateLimitResponse;
    const parsedCode = trackingCodeSchema.safeParse(searchParams.get('trackingCode') ?? '');
    if (!parsedCode.success) {
      return NextResponse.json({ error: 'Code de suivi invalide.' }, { status: 400 });
    }

    try {
      const order = await findPublicTrackedOrder(parsedCode.data);
      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Commande introuvable.', data: null },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: order }, { status: 200 });
    } catch (error: unknown) {
      return handleDatabaseError(error, 'Erreur lors de la récupération de la commande.');
    }
  }

  const restaurantIdParam = searchParams.get('restaurantId');
  const auth = await authorizeRequest(request, 'ORDERS_READ', restaurantIdParam);
  if (auth.response) return auth.response;
  try {
    const orders = await prisma.order.findMany({
      where: { restaurantId: auth.session.restaurantId },
      include: { items: true, statusHistory: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors de la récupération des commandes.');
  }
}
