ALTER TABLE "business" DROP CONSTRAINT "business_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "business" ADD CONSTRAINT "business_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;