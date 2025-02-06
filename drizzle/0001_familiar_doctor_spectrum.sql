CREATE TABLE "business" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "business_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"businessName" varchar(255) NOT NULL,
	"businessType" varchar(255) NOT NULL,
	"businessEmail" varchar(255),
	"panNumber" varchar(12),
	CONSTRAINT "business_businessEmail_unique" UNIQUE("businessEmail"),
	CONSTRAINT "business_panNumber_unique" UNIQUE("panNumber")
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_panNumber_unique";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "business" ADD CONSTRAINT "business_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "businessName";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "businessType";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "panNumber";