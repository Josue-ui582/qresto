import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { OrderStatus, OrderType, PaymentMethod, PaymentStatus } from 'generated/prisma/enums';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/auth/session';
import { handleDatabaseError, parseJson } from '@/lib/api/validation';
import { enforceRateLimit } from '@/lib/rate-limit';
import { findPublicTrackedOrder } from '@/lib/orders/public-order';

const createOrderSchema = z.object({
  restaurantId: z.string().min(1),
  type: z.nativeEnum(OrderType).default(OrderType.DINE_IN),
  tableNumber: z.union([z.string().trim().min(1).max(30), z.number().int().positive()]).optional(),
  customerName: z.string().trim().min(1).max(150),
  customerPhone: z.string().trim().min(8).max(30).refine(
    (phone) => phone.replace(/\D/g, '').length >= 8,
    'Un numéro WhatsApp valide est requis.'
  ),
  customerAddress: z.string().trim().max(500).optional(),
  customerNotes: z.string().trim().max(1000).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH_ON_DELIVERY),
  items: z.array(z.object({
    dishId: z.string().min(1),
    quantity: z.number().int().min(1).max(100),
    notes: z.string().trim().max(500).optional(),
  })).min(1).max(50),
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

const trackingCodeSchema = z.string().trim().regex(/^QR-(?:\d{4}|[A-F0-9]{12})$/i);

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

    const dishIds = [...new Set(input.items.map((item) => item.dishId))];
    const dishes = await prisma.dish.findMany({
      where: {
        id: { in: dishIds },
        restaurantId: restaurant.id,
        isAvailable: true,
      },
      select: { id: true, name: true, price: true },
    });
    const dishesById = new Map(dishes.map((dish) => [dish.id, dish]));
    if (dishesById.size !== dishIds.length) {
      return NextResponse.json(
        { error: 'Un ou plusieurs plats ne sont plus disponibles.' },
        { status: 400 }
      );
    }

    const items = input.items.map((item) => ({
      ...item,
      dish: dishesById.get(item.dishId)!,
    }));
    const subtotal = items.reduce(
      (sum, item) => sum + item.dish.price * item.quantity,
      0
    );
    const deliveryFee = input.type === OrderType.DELIVERY ? restaurant.deliveryFee : 0;
    const total = subtotal + deliveryFee;
    if (!Number.isSafeInteger(total) || total > 2_147_483_647) {
      return NextResponse.json({ error: 'Le montant de la commande est invalide.' }, { status: 400 });
    }

    const trackingCode = `QR-${randomBytes(6).toString('hex').toUpperCase()}`;
    const newOrder = await prisma.order.create({
      data: {
        trackingCode,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantPhone: restaurant.phone,
        type: input.type,
        tableNumber: input.type === OrderType.DINE_IN ? String(input.tableNumber) : null,
        subtotal,
        deliveryFee,
        total,
        status: OrderStatus.NEW,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerAddress: input.type === OrderType.DELIVERY ? input.customerAddress : null,
        customerNotes: input.customerNotes || null,
        paymentMethod: input.paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        items: {
          create: items.map((item) => ({
            dishId: item.dish.id,
            name: item.dish.name,
            price: item.dish.price,
            quantity: item.quantity,
            notes: item.notes || null,
          })),
        },
        statusHistory: {
          create: {
            status: OrderStatus.NEW,
            comment: 'Commande enregistrée',
          },
        },
      },
    });

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
