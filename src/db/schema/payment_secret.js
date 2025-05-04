import { pgTable, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const paymentSecretsTable = pgTable("payment_secrets", {
  userId: varchar('userId').primaryKey().references(() => usersTable.id, { onDelete: 'cascade' }),

  paymentProvider: varchar({ length: 50 }).notNull(),

  liveSecretKey: varchar({ length: 255 }),
});
