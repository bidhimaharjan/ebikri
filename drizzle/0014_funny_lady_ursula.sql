ALTER TABLE "order" ADD COLUMN "discountAmount" numeric DEFAULT 0;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "promoCode" varchar(50);