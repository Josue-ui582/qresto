ALTER TABLE "reviews"
ADD COLUMN "orderId" TEXT,
ADD COLUMN "isApproved" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "reviews_orderId_key" ON "reviews"("orderId");
CREATE INDEX "reviews_restaurantId_isApproved_idx" ON "reviews"("restaurantId", "isApproved");

ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "orders"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
