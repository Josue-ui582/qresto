ALTER TABLE "invoices" ALTER COLUMN "status" SET DEFAULT 'PENDING';
ALTER TABLE "subscription_history" ALTER COLUMN "status" SET DEFAULT 'PENDING';
ALTER TABLE "subscriptions" ALTER COLUMN "autoRenew" SET DEFAULT false;
UPDATE "subscriptions" SET "autoRenew" = false;
