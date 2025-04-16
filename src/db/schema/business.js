import { integer, pgTable, varchar, bigint } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const businessTable = pgTable("business", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  userId: varchar('userId').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),

  businessName: varchar({ length: 255 }),

  businessType: varchar({ length: 255 }),

  businessEmail: varchar({ length: 255 }).unique(),

  panNumber: varchar({ length: 12 }).unique(),
});