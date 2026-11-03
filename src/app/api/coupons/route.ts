import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/auth/session';
import { handleDatabaseError, parseJson, parseQueryParam } from '@/lib/api/validation';

const codeSchema = z.string().trim().min(3).max(30).regex(/^[A-Za-z0-9_-]+$/)
  .transform((value) => value.toUpperCase());

const couponFieldsBaseSchema = z.object({
  code: codeSchema,
  discount: z.number().int().min(1).max(100_000_000),
  isPercentage: z.boolean(),
  minOrder: z.number().int().min(0).max(100_000_000).default(0),
  startsAt: z.string().datetime().nullable().optional().transform((value) => value ? new Date(value) : null),
  expiresAt: z.string().datetime().nullable().optional().transform((value) => value ? new Date(value) : null),
  maxUses: z.number().int().positive().nullable().optional(),
  active: z.boolean().default(true),
});

const couponFieldsSchema = couponFieldsBaseSchema.superRefine((value, context) => {
  if (value.isPercentage && value.discount > 100) {
    context.addIssue({
      code: 'custom',
      path: ['discount'],
      message: 'Une remise en pourcentage ne peut pas dépasser 100%.',
    });
  }
  if (value.startsAt && value.expiresAt && value.startsAt >= value.expiresAt) {
    context.addIssue({
      code: 'custom',
      path: ['expiresAt'],
      message: 'La date de fin doit être postérieure à la date de début.',
    });
  }
});

const createCouponSchema = couponFieldsSchema.extend({
  restaurantId: z.string().trim().min(1).max(100),
});

const updateCouponSchema = couponFieldsBaseSchema.partial().extend({
  id: z.string().trim().min(1).max(100),
}).superRefine((value, context) => {
  if (
    value.isPercentage === true &&
    value.discount !== undefined &&
    value.discount > 100
  ) {
    context.addIssue({
      code: 'custom',
      path: ['discount'],
      message: 'Une remise en pourcentage ne peut pas dépasser 100%.',
    });
  }
  if (value.startsAt && value.expiresAt && value.startsAt >= value.expiresAt) {
    context.addIssue({
      code: 'custom',
      path: ['expiresAt'],
      message: 'La date de fin doit être postérieure à la date de début.',
    });
  }
}).refine((value) => Object.keys(value).some((key) => key !== 'id'), {
  message: 'Au moins un champ doit être fourni.',
});

export async function GET(request: NextRequest) {
  const restaurantId = new URL(request.url).searchParams.get('restaurantId');
  const auth = await authorizeRequest(request, 'COUPONS_ADMIN', restaurantId);
  if (auth.response) return auth.response;

  try {
    const coupons = await prisma.coupon.findMany({
      where: { restaurantId: auth.session.restaurantId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, coupons });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible de charger les codes promotionnels.');
  }
}

export async function POST(request: NextRequest) {
  const parsed = await parseJson(request, createCouponSchema);
  if (!parsed.success) return parsed.response;
  const auth = await authorizeRequest(request, 'COUPONS_ADMIN', parsed.data.restaurantId);
  if (auth.response) return auth.response;

  try {
    const coupon = await prisma.coupon.create({
      data: { ...parsed.data, restaurantId: auth.session.restaurantId },
    });
    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible de créer ce code promotionnel.');
  }
}

export async function PUT(request: NextRequest) {
  const parsed = await parseJson(request, updateCouponSchema);
  if (!parsed.success) return parsed.response;
  const auth = await authorizeRequest(request, 'COUPONS_ADMIN');
  if (auth.response) return auth.response;

  try {
    const { id, ...data } = parsed.data;
    const result = await prisma.coupon.updateMany({
      where: { id, restaurantId: auth.session.restaurantId },
      data,
    });
    if (!result.count) {
      return NextResponse.json({ error: 'Code promotionnel introuvable.' }, { status: 404 });
    }
    const coupon = await prisma.coupon.findFirst({
      where: { id, restaurantId: auth.session.restaurantId },
    });
    return NextResponse.json({ success: true, coupon });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible de modifier ce code promotionnel.');
  }
}

export async function DELETE(request: NextRequest) {
  const parsedId = parseQueryParam(new URL(request.url).searchParams.get('id'), 'Identifiant de coupon');
  if (!parsedId.success) return parsedId.response;
  if (!parsedId.data) {
    return NextResponse.json({ error: 'Identifiant de coupon requis.' }, { status: 400 });
  }
  const auth = await authorizeRequest(request, 'COUPONS_ADMIN');
  if (auth.response) return auth.response;

  try {
    const deleted = await prisma.coupon.deleteMany({
      where: { id: parsedId.data, restaurantId: auth.session.restaurantId },
    });
    if (!deleted.count) {
      return NextResponse.json({ error: 'Code promotionnel introuvable.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible de supprimer ce code promotionnel.');
  }
}
