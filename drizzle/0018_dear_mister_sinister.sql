ALTER TABLE "sales" RENAME COLUMN "salesId" TO "orderId";--> statement-breakpoint
ALTER TABLE "sales" DROP CONSTRAINT "sales_salesId_sales_id_fk";
--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_orderId_order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;