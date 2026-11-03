import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError, parseJson } from '@/lib/api/validation';
import { enforceRateLimit } from '@/lib/rate-limit';
import { calculateCouponDiscount, getCouponValidationError } from '@/lib/orders/coupons';

const validateCouponSchema = z.object({
  restaurantId: z.string().trim().min(1).max(100),
  code: z.string().trim().min(3).max(30).regex(/^[A-Za-z0-9_-]+$/)
    .transform((value) => value.toUpperCase()),
  subtotal: z.number().int().min(0).max(2_147_483_647),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(request, 'coupon-validate', {
    limit: 20,
    windowMs: 60 * 1000,
  });
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = await parseJson(request, validateCouponSchema);
  if (!parsed.success) return parsed.response;

  try {
    const coupon = await prisma.coupon.findFirst({
      where: {
        restaurantId: parsed.data.restaurantId,
        code: parsed.data.code,
      },
    });
    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Code promotionnel invalide.' }, { status: 404 });
    }

    const error = getCouponValidationError(coupon, parsed.data.subtotal);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }
    const discount = calculateCouponDiscount(parsed.data.subtotal, coupon);
    if (discount === null) {
      return NextResponse.json({ success: false, error: 'La remise ne peut pas être calculée.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        discount,
        subtotal: parsed.data.subtotal,
        totalAfterDiscount: parsed.data.subtotal - discount,
      },
    });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible de vérifier ce code promotionnel.');
  }
}
