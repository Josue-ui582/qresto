ALTER TABLE "coupons"
ADD COLUMN "startsAt" TIMESTAMP(3),
ADD COLUMN "maxUses" INTEGER,
ADD COLUMN "usageCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "orders"
ADD COLUMN "couponDiscount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "coupons"
ADD CONSTRAINT "coupons_discount_check" CHECK ("discount" >= 0),
ADD CONSTRAINT "coupons_minOrder_check" CHECK ("minOrder" >= 0),
ADD CONSTRAINT "coupons_maxUses_check" CHECK ("maxUses" IS NULL OR "maxUses" > 0),
ADD CONSTRAINT "coupons_usageCount_check" CHECK ("usageCount" >= 0),
ADD CONSTRAINT "coupons_discount_percentage_check" CHECK (NOT "isPercentage" OR "discount" <= 100);
