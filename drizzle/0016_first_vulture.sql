ALTER TABLE "order" ALTER COLUMN "discountPercent" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "discountPercent" DROP NOT NULL;