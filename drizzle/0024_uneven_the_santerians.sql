ALTER TABLE "business" ALTER COLUMN "userId" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT 'GENERATED ALWAYS AS IDENTITY';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP IDENTITY;