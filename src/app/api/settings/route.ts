import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET : Récupérer les paramètres complets du restaurant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Identifiant du restaurant requis.' },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        email: true,
        currency: true,
        description: true,
        openingHours: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant introuvable.' },
        { status: 404 }
      );
    }

    let settings = await prisma.restaurantSettings.findUnique({
      where: { restaurantId },
    });

    // Seed configuration with the restaurant's actual public information.
    if (!settings) {
      settings = await prisma.restaurantSettings.create({
        data: {
          restaurantId,
          name: restaurant.name,
          phone: restaurant.phone || '',
          address: restaurant.address,
          currency: restaurant.currency,
          description: restaurant.description,
          enableQrOrders: true,
          enableSoundAlerts: true,
          notificationEmail: restaurant.email || '',
          serviceFeePercent: 0,
          openingHours:
            restaurant.openingHours ||
            JSON.stringify({
              monday: { open: '11:00', close: '23:00', active: true },
              tuesday: { open: '11:00', close: '23:00', active: true },
              wednesday: { open: '11:00', close: '23:00', active: true },
              thursday: { open: '11:00', close: '23:00', active: true },
              friday: { open: '11:00', close: '00:00', active: true },
              saturday: { open: '11:00', close: '00:00', active: true },
              sunday: { open: '12:00', close: '22:00', active: false },
            }),
        },
      });
    }

    return NextResponse.json({ success: true, settings }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur API GET /api/settings:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des paramètres.' },
      { status: 500 }
    );
  }
}

// PUT / POST : Mettre à jour les paramètres du restaurant
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, ...updatedFields } = body;

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Identifiant du restaurant requis.' },
        { status: 400 }
      );
    }

    // Ensure both the detailed settings and restaurant profile remain in sync.
    if (updatedFields.openingHours && typeof updatedFields.openingHours !== 'string') {
      updatedFields.openingHours = JSON.stringify(updatedFields.openingHours);
    }

    const [settings] = await prisma.$transaction([
      prisma.restaurantSettings.upsert({
        where: { restaurantId },
        update: updatedFields,
        create: { restaurantId, ...updatedFields },
      }),
      prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
          ...(updatedFields.name !== undefined && { name: updatedFields.name }),
          ...(updatedFields.phone !== undefined && { phone: updatedFields.phone }),
          ...(updatedFields.address !== undefined && { address: updatedFields.address }),
          ...(updatedFields.currency !== undefined && { currency: updatedFields.currency }),
          ...(updatedFields.description !== undefined && { description: updatedFields.description }),
          ...(updatedFields.openingHours !== undefined && {
            openingHours: updatedFields.openingHours,
          }),
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: 'Paramètres mis à jour avec succès.',
        settings,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur API PUT /api/settings:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l’enregistrement des paramètres.' },
      { status: 500 }
    );
  }
}
