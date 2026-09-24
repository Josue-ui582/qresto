import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, tableNumber, items, customerName, customerPhone, paymentMethod } = body;

    if (!restaurantId || !items || !items.length) {
      return NextResponse.json(
        { success: false, error: 'Informations de commande incomplètes' },
        { status: 400 }
      );
    }

    const orderNumber = `QR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: `ord_${Date.now()}`,
      orderNumber,
      restaurantId,
      tableNumber: tableNumber || 1,
      items,
      customerName: customerName || 'Client anonyme',
      customerPhone: customerPhone || '',
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Commande enregistrée avec succès',
      data: newOrder,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
