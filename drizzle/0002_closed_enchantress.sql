ALTER TABLE "inventory" ADD COLUMN "businessId" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory" ADD COLUMN "productName" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory" ADD COLUMN "stockAvailability" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory" ADD COLUMN "unitPrice" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_businessId_business_id_fk" FOREIGN KEY ("businessId") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;