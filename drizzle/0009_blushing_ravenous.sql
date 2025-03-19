CREATE TABLE "sales" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sales_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"productId" integer NOT NULL,
	"quantitySold" integer NOT NULL,
	"revenue" numeric NOT NULL,
	"sale_date" date NOT NULL,
	"discountAmount" numeric DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;