import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET : Récupérer tous les QR codes configurés avec leurs URLs générées
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    // Domaine de base de l'application
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get('origin') ||
      'https://qresto.africa';

    const whereCondition = restaurantId ? { restaurantId } : {};

    // Récupération des tables et des infos restaurant associées
    const tables = await prisma.restaurantTable.findMany({
      where: whereCondition,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        number: 'asc',
      },
    });

    // Formater et enrichir les données pour la signalétique QR
    const qrCodesData = tables.map((table) => {
      const slug = table.restaurant?.slug || 'menu';
      // URL de commande sur laquelle le client atterrit en scannant
      const targetUrl = `${baseUrl}/restaurant/${slug}?table=${table.number}`;

      // URL de l'image QR Code HD (500x500px)
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
        targetUrl
      )}&color=1c1917`;

      return {
        id: table.id,
        number: table.number,
        capacity: table.capacity,
        name: table.name,
        restaurantId: table.restaurantId,
        restaurant: table.restaurant,
        targetUrl,
        qrImageUrl,
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: qrCodesData.length,
        tables: qrCodesData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur API GET /api/qr-codes:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la génération des QR codes.' },
      { status: 500 }
    );
  }
}
