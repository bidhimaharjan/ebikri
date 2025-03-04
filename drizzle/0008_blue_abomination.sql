ALTER TABLE "payment" ADD COLUMN "paymentMethod" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "paymentDetails" text;