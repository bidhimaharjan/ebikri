ALTER TABLE "business" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "business" DROP CONSTRAINT "business_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "business" ADD CONSTRAINT "business_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;