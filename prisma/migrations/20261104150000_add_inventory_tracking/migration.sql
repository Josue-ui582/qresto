CREATE TYPE "InventoryMovementType" AS ENUM ('RESTOCK', 'ADJUSTMENT', 'ORDER');

ALTER TABLE "dishes"
ADD COLUMN "stockQuantity" INTEGER,
ADD COLUMN "lowStockThreshold" INTEGER;

ALTER TABLE "dishes"
ADD CONSTRAINT "dishes_stockQuantity_check"
CHECK ("stockQuantity" IS NULL OR "stockQuantity" >= 0),
ADD CONSTRAINT "dishes_lowStockThreshold_check"
CHECK ("lowStockThreshold" IS NULL OR "lowStockThreshold" >= 0);

CREATE TABLE "inventory_movements" (
  "id" TEXT NOT NULL,
  "dishId" TEXT NOT NULL,
  "orderId" TEXT,
  "quantityChange" INTEGER NOT NULL,
  "type" "InventoryMovementType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "inventory_movements_dishId_fkey"
    FOREIGN KEY ("dishId") REFERENCES "dishes"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "inventory_movements_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "orders"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "inventory_movements_dishId_createdAt_idx"
ON "inventory_movements"("dishId", "createdAt");
CREATE INDEX "inventory_movements_orderId_idx"
ON "inventory_movements"("orderId");
