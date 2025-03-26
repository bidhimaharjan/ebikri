CREATE TABLE "marketing" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "marketing_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"businessId" integer NOT NULL,
	"campaignName" text NOT NULL,
	"discountPercent" numeric NOT NULL,
	"promoCode" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"active" boolean DEFAULT true,
	CONSTRAINT "marketing_promoCode_unique" UNIQUE("promoCode")
);
--> statement-breakpoint
ALTER TABLE "marketing" ADD CONSTRAINT "marketing_businessId_business_id_fk" FOREIGN KEY ("businessId") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;