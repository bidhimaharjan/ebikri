ALTER TABLE "business" ALTER COLUMN "userId" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT nextval('users_id_seq'::regclass);