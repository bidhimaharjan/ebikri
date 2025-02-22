CREATE TABLE "customer" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customer_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"businessId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"phoneNumber" varchar(10) NOT NULL,
	"email" varchar(255) NOT NULL,
	"added_date" date NOT NULL,
	"totalOrders" integer NOT NULL,
	CONSTRAINT "customer_phoneNumber_unique" UNIQUE("phoneNumber"),
	CONSTRAINT "customer_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"businessId" integer NOT NULL,
	"customerName" varchar(255) NOT NULL,
	"phoneNumber" varchar(10) NOT NULL,
	"deliveryLocation" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"totalAmount" numeric NOT NULL,
	"order_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orderproduct" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orderproduct_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"orderId" integer NOT NULL,
	"productId" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unitPrice" numeric NOT NULL,
	"amount" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"businessId" integer NOT NULL,
	"productName" varchar(255) NOT NULL,
	"stockAvailability" integer NOT NULL,
	"unitPrice" numeric NOT NULL
);
--> statement-breakpoint
DROP TABLE "inventory" CASCADE;--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_businessId_business_id_fk" FOREIGN KEY ("businessId") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_businessId_business_id_fk" FOREIGN KEY ("businessId") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orderproduct" ADD CONSTRAINT "orderproduct_orderId_order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orderproduct" ADD CONSTRAINT "orderproduct_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_businessId_business_id_fk" FOREIGN KEY ("businessId") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;