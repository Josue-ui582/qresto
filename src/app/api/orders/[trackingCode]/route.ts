// src/app/api/orders/[trackingCode]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { trackingCode: string } }
) {
  try {
    const code = params.trackingCode?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code de suivi invalide' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { trackingCode: code },
          { id: code }
        ]
      },
      include: {
        items: true,
        statusHistory: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Commande introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la commande' },
      { status: 500 }
    );
  }
}
