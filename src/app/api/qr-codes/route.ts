import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError } from '@/lib/api/validation';
import { authorizeRequest } from '@/lib/auth/session';
import { createTableMenuUrl, generateQrCodeSvgDataUrl } from '@/lib/qr-code';

// GET : Récupérer tous les QR codes configurés avec leurs URLs générées
export async function GET(request: NextRequest) {
  const restaurantIdParam = z.string().min(1).safeParse(
    new URL(request.url).searchParams.get('restaurantId')
  );
  if (new URL(request.url).searchParams.has('restaurantId') && !restaurantIdParam.success) {
    return NextResponse.json({ error: 'Identifiant de restaurant invalide.' }, { status: 400 });
  }
  const auth = await authorizeRequest(
    request,
    'QR_READ',
    restaurantIdParam.success ? restaurantIdParam.data : null
  );
  if (auth.response) return auth.response;

  try {
    // Domaine de base de l'application
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get('origin') ||
      request.nextUrl.origin;

    // Récupération des tables et des infos restaurant associées
    const tables = await prisma.restaurantTable.findMany({
      where: { restaurantId: auth.session.restaurantId },
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
    const qrCodesData = await Promise.all(tables.map(async (table) => {
      const slug = table.restaurant.slug;
      const targetUrl = createTableMenuUrl(baseUrl, slug, table.number);
      const qrImageUrl = await generateQrCodeSvgDataUrl(targetUrl);

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
    }));

    return NextResponse.json(
      {
        success: true,
        count: qrCodesData.length,
        tables: qrCodesData,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors de la génération des QR codes.');
  }
}
