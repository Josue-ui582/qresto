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

    let settings = await prisma.restaurantSettings.findUnique({
      where: { restaurantId },
    });

    // Si aucun paramètre n'existe encore, création des réglages par défaut
    if (!settings) {
      settings = await prisma.restaurantSettings.create({
        data: {
          restaurantId,
          name: 'Mon Restaurant',
          phone: '+221 77 000 00 00',
          address: 'Dakar, Sénégal',
          currency: 'FCFA',
          description: 'Cuisine authentique et service rapide.',
          enableQrOrders: true,
          enableSoundAlerts: true,
          notificationEmail: 'contact@restaurant.com',
          serviceFeePercent: 0,
          wifiName: 'Resto_Guest_WiFi',
          wifiPassword: 'WelcomeToResto',
          openingHours: JSON.stringify({
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
    console.error('Erreur API GET /api/restaurant/settings:', error);
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

    // Sécurisation du format JSON des horaires si présent
    if (updatedFields.openingHours && typeof updatedFields.openingHours !== 'string') {
      updatedFields.openingHours = JSON.stringify(updatedFields.openingHours);
    }

    const settings = await prisma.restaurantSettings.upsert({
      where: { restaurantId },
      update: {
        ...updatedFields,
      },
      create: {
        restaurantId,
        ...updatedFields,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Paramètres mis à jour avec succès.',
        settings,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur API PUT /api/restaurant/settings:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l’enregistrement des paramètres.' },
      { status: 500 }
    );
  }
}
