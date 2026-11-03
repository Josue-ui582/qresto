ALTER TABLE "reviews"
ALTER COLUMN "customerName" DROP NOT NULL,
ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "reviews_restaurantId_createdAt_idx"
ON "reviews"("restaurantId", "createdAt");

CREATE INDEX "reviews_restaurantId_isVisible_createdAt_idx"
ON "reviews"("restaurantId", "isVisible", "createdAt");
