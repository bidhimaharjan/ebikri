CREATE TABLE "payment_secrets" (
	"userId" varchar PRIMARY KEY NOT NULL,
	"paymentProvider" varchar(50) NOT NULL,
	"secretKey" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "payment_secrets" ADD CONSTRAINT "payment_secrets_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;