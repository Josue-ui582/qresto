ALTER TABLE "orders"
ADD COLUMN "customerWhatsapp" TEXT,
ADD COLUMN "whatsappConsent" BOOLEAN NOT NULL DEFAULT false;
