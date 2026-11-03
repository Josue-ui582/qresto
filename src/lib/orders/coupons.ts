export interface CouponTerms {
  active: boolean;
  discount: number;
  isPercentage: boolean;
  minOrder: number;
  startsAt: Date | null;
  expiresAt: Date | null;
  maxUses: number | null;
  usageCount: number;
}

export function getCouponValidationError(
  coupon: CouponTerms,
  subtotal: number,
  now: Date = new Date()
): string | null {
  if (!coupon.active) return 'Ce code promotionnel n’est plus actif.';
  if (coupon.startsAt && coupon.startsAt > now) return 'Ce code promotionnel n’est pas encore valide.';
  if (coupon.expiresAt && coupon.expiresAt <= now) return 'Ce code promotionnel a expiré.';
  if (coupon.maxUses !== null && coupon.usageCount >= coupon.maxUses) {
    return 'Ce code promotionnel a atteint son nombre maximal d’utilisations.';
  }
  if (!Number.isSafeInteger(subtotal) || subtotal < coupon.minOrder) {
    return `Le minimum de commande pour ce code est de ${coupon.minOrder}.`;
  }
  return null;
}

export function calculateCouponDiscount(subtotal: number, coupon: CouponTerms): number | null {
  if (!Number.isSafeInteger(subtotal) || subtotal < 0) return null;
  if (!Number.isSafeInteger(coupon.discount) || coupon.discount < 0) return null;
  if (coupon.isPercentage && coupon.discount > 100) return null;
  const discount = coupon.isPercentage
    ? Math.floor((subtotal * coupon.discount) / 100)
    : coupon.discount;
  return Math.min(subtotal, discount);
}
