import { pgTable, varchar, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { businessTable } from "./business";

export const paymentSecretsTable = pgTable("payment_secrets", {
  userId: varchar('userId').primaryKey().references(() => usersTable.id, { onDelete: 'cascade' }),

  businessId: integer().notNull().references(() => businessTable.id, { onDelete: "cascade" }),

  paymentProvider: varchar({ length: 50 }).notNull(),

  liveSecretKey: varchar({ length: 255 }),
});
