import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus, OrderType, PaymentMethod, PaymentStatus } from 'generated/prisma/enums';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      restaurantId,
      type = OrderType.DINE_IN,
      tableNumber,
      customerName,
      customerPhone,
      customerAddress,
      customerNotes,
      paymentMethod = PaymentMethod.CASH_ON_DELIVERY,
      items,
    } = body;

    // 1. Validation des champs obligatoires
    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Informations de commande incomplètes.' },
        { status: 400 }
      );
    }

    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { success: false, error: 'Nom et téléphone du client obligatoires.' },
        { status: 400 }
      );
    }

    if (type === OrderType.DINE_IN && !tableNumber) {
      return NextResponse.json(
        { success: false, error: 'Numéro de table obligatoire pour les commandes sur place.' },
        { status: 400 }
      );
    }

    if (type === OrderType.DELIVERY && !customerAddress) {
      return NextResponse.json(
        { success: false, error: 'Adresse de livraison obligatoire.' },
        { status: 400 }
      );
    }

    // 2. Récupération des informations du restaurant (Requis pour restaurantName et restaurantPhone)
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        phone: true,
        deliveryFee: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant introuvable.' },
        { status: 404 }
      );
    }

    // 3. Calculs financiers (Convertis en Int)
    const rawSubtotal = items.reduce((sum: number, item: any) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      return sum + price * quantity;
    }, 0);

    const subtotal = Math.round(rawSubtotal);
    const deliveryFee = type === OrderType.DELIVERY ? Math.round(restaurant.deliveryFee || 0) : 0;
    const total = subtotal + deliveryFee;

    // 4. Code de suivi unique
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `QR-${randomSuffix}`;

    // 5. Enregistrement en base de données
    const newOrder = await prisma.order.create({
      data: {
        trackingCode,
        restaurantId,
        restaurantName: restaurant.name,
        restaurantPhone: restaurant.phone || null,
        type: type as OrderType,
        tableNumber: type === OrderType.DINE_IN ? String(tableNumber) : null,
        subtotal,
        deliveryFee,
        total,
        status: OrderStatus.NEW,
        customerName,
        customerPhone,
        customerAddress: type === OrderType.DELIVERY ? customerAddress : null,
        customerNotes: customerNotes || null,
        paymentMethod: paymentMethod as PaymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        items: {
          create: items.map((item: any) => ({
            dishId: item.dishId || null,
            name: item.name,
            price: Math.round(Number(item.price)),
            quantity: Number(item.quantity),
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
      include: {
        items: true,
        statusHistory: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Commande enregistrée avec succès',
      data: newOrder,
    });
  } catch (err: any) {
    console.error('Erreur API POST /api/orders :', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur serveur lors de la création de la commande.' },
      { status: 500 }
    );
  }
}
