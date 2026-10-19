import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError, parseJson } from '@/lib/api/validation';
import { authorizeRequest } from '@/lib/auth/session';

const openingHoursSchema = z.union([
  z.string().max(5000),
  z.record(z.string(), z.object({
    open: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    close: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    active: z.boolean(),
  })),
]);

const updateSettingsSchema = z.object({
  restaurantId: z.string().optional(),
  name: z.string().trim().min(1).max(150).optional(),
  phone: z.string().trim().max(40).optional(),
  address: z.string().trim().max(500).optional(),
  currency: z.enum(['FCFA', 'EUR', 'USD', 'MAD']).optional(),
  description: z.string().trim().max(2000).optional(),
  enableQrOrders: z.boolean().optional(),
  enableSoundAlerts: z.boolean().optional(),
  notificationEmail: z.union([z.string().email(), z.literal('')]).optional(),
  notificationPhone: z.string().trim().max(40).optional(),
  serviceFeePercent: z.number().min(0).max(100).optional(),
  wifiName: z.string().trim().max(100).optional(),
  wifiPassword: z.string().max(200).optional(),
  openingHours: openingHoursSchema.optional(),
}).refine((value) => Object.keys(value).some((key) => key !== 'restaurantId'), {
  message: 'Au moins un paramètre doit être fourni.',
});

const defaultOpeningHours = {
  monday: { open: '11:00', close: '23:00', active: true },
  tuesday: { open: '11:00', close: '23:00', active: true },
  wednesday: { open: '11:00', close: '23:00', active: true },
  thursday: { open: '11:00', close: '23:00', active: true },
  friday: { open: '11:00', close: '00:00', active: true },
  saturday: { open: '11:00', close: '00:00', active: true },
  sunday: { open: '12:00', close: '22:00', active: false },
};

export async function GET(request: NextRequest) {
  const restaurantIdParam = new URL(request.url).searchParams.get('restaurantId');
  const auth = await authorizeRequest(request, 'SETTINGS_ADMIN', restaurantIdParam);
  if (auth.response) return auth.response;

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: auth.session.restaurantId },
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
      return NextResponse.json({ error: 'Restaurant introuvable.' }, { status: 404 });
    }

    const settings = await prisma.restaurantSettings.upsert({
      where: { restaurantId: auth.session.restaurantId },
      update: {},
      create: {
        restaurantId: auth.session.restaurantId,
        name: restaurant.name,
        phone: restaurant.phone || '',
        address: restaurant.address,
        currency: restaurant.currency,
        description: restaurant.description,
        enableQrOrders: true,
        enableSoundAlerts: true,
        notificationEmail: restaurant.email || '',
        serviceFeePercent: 0,
        openingHours: restaurant.openingHours || JSON.stringify(defaultOpeningHours),
      },
    });
    return NextResponse.json({ success: true, settings }, { status: 200 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors de la récupération des paramètres.');
  }
}

export async function PUT(request: NextRequest) {
  const parsed = await parseJson(request, updateSettingsSchema);
  if (!parsed.success) return parsed.response;
  const auth = await authorizeRequest(request, 'SETTINGS_ADMIN', parsed.data.restaurantId);
  if (auth.response) return auth.response;

  try {
    const { openingHours, ...input } = updateSettingsSchema
      .omit({ restaurantId: true })
      .parse(parsed.data);
    const serializedOpeningHours = openingHours === undefined
      ? undefined
      : typeof openingHours === 'string'
        ? openingHours
        : JSON.stringify(openingHours);
    const updatedFields = {
      ...input,
      ...(serializedOpeningHours !== undefined && { openingHours: serializedOpeningHours }),
    };
    const [settings] = await prisma.$transaction([
      prisma.restaurantSettings.upsert({
        where: { restaurantId: auth.session.restaurantId },
        update: updatedFields,
        create: { restaurantId: auth.session.restaurantId, ...updatedFields },
      }),
      prisma.restaurant.update({
        where: { id: auth.session.restaurantId },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.phone !== undefined && { phone: input.phone }),
          ...(input.address !== undefined && { address: input.address }),
          ...(input.currency !== undefined && { currency: input.currency }),
          ...(input.description !== undefined && { description: input.description }),
          ...(updatedFields.openingHours !== undefined && {
            openingHours: updatedFields.openingHours,
          }),
        },
      }),
    ]);

    return NextResponse.json(
      { success: true, message: 'Paramètres mis à jour avec succès.', settings },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors de l’enregistrement des paramètres.');
  }
}
