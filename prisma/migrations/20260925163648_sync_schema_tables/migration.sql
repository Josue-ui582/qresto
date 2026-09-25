/*
  Warnings:

  - You are about to drop the column `settings` on the `restaurants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "options" JSONB;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "couponCode" TEXT;

-- AlterTable
ALTER TABLE "restaurants" DROP COLUMN "settings";

-- CreateTable
CREATE TABLE "restaurant_settings" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Mon Restaurant',
    "phone" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT 'FCFA',
    "description" TEXT,
    "enableQrOrders" BOOLEAN NOT NULL DEFAULT true,
    "enableSoundAlerts" BOOLEAN NOT NULL DEFAULT true,
    "notificationEmail" TEXT NOT NULL DEFAULT '',
    "notificationPhone" TEXT,
    "serviceFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wifiName" TEXT,
    "wifiPassword" TEXT,
    "openingHours" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dish_option_groups" (
    "id" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "minSelection" INTEGER NOT NULL DEFAULT 0,
    "maxSelection" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "dish_option_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dish_options" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "dish_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "dishId" TEXT,
    "customerName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount" INTEGER NOT NULL,
    "isPercentage" BOOLEAN NOT NULL DEFAULT false,
    "minOrder" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_history" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PAID',
    "paymentRef" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_settings_restaurantId_key" ON "restaurant_settings"("restaurantId");

-- CreateIndex
CREATE INDEX "dish_option_groups_dishId_idx" ON "dish_option_groups"("dishId");

-- CreateIndex
CREATE INDEX "dish_options_groupId_idx" ON "dish_options"("groupId");

-- CreateIndex
CREATE INDEX "reviews_restaurantId_idx" ON "reviews"("restaurantId");

-- CreateIndex
CREATE INDEX "coupons_restaurantId_idx" ON "coupons"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_restaurantId_code_key" ON "coupons"("restaurantId", "code");

-- CreateIndex
CREATE INDEX "subscription_history_restaurantId_idx" ON "subscription_history"("restaurantId");

-- CreateIndex
CREATE INDEX "notifications_restaurantId_idx" ON "notifications"("restaurantId");

-- AddForeignKey
ALTER TABLE "restaurant_settings" ADD CONSTRAINT "restaurant_settings_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_option_groups" ADD CONSTRAINT "dish_option_groups_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_options" ADD CONSTRAINT "dish_options_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "dish_option_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_history" ADD CONSTRAINT "subscription_history_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
