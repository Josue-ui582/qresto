-- AlterTable
ALTER TABLE "faq_items" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "testimonials" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "faq_items_active_order_idx" ON "faq_items"("active", "order");

-- CreateIndex
CREATE INDEX "testimonials_active_order_idx" ON "testimonials"("active", "order");
