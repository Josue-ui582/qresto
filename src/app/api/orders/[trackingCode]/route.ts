import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from 'generated/prisma/enums'; // Adaptez l'import selon vos enums Prisma

// 1. Récupération d'une commande (GET)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingCode: string }> | { trackingCode: string } }
) {
  try {
    const resolvedParams = await params;
    const code = resolvedParams.trackingCode?.trim();

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
          { trackingCode: code.toUpperCase() },
          { trackingCode: code.replace('QR-', 'QR- ') },
          { id: code }
        ]
      },
      include: {
        items: true,
        statusHistory: true
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

// 2. Mise à jour du statut d'une commande (PATCH)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ trackingCode: string }> | { trackingCode: string } }
) {
  try {
    const resolvedParams = await params;
    const identifier = resolvedParams.trackingCode?.trim();
    const body = await request.json();
    const { status } = body;

    if (!identifier || !status) {
      return NextResponse.json(
        { success: false, error: 'Identifiant de commande et nouveau statut requis.' },
        { status: 400 }
      );
    }

    // Recherche de la commande existante (par ID ou par trackingCode)
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { id: identifier },
          { trackingCode: identifier }
        ]
      }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'Commande introuvable' },
        { status: 404 }
      );
    }

    // Mise à jour de la commande et création de l'entrée d'historique
    const updatedOrder = await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        status: status as OrderStatus,
        statusHistory: {
          create: {
            status: status as OrderStatus,
            comment: `Statut mis à jour vers : ${status}`,
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
      message: 'Statut mis à jour avec succès',
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error('Erreur API PATCH /api/orders/[trackingCode] :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
