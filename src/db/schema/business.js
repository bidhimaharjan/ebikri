import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const businessTable = pgTable("business", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  userId: integer().notNull().references(() => usersTable.id, { onDelete: "cascade" }),

  businessName: varchar({ length: 255 }).notNull(),

  businessType: varchar({ length: 255 }).notNull(),

  businessEmail: varchar({ length: 255 }).unique(),

  panNumber: varchar({ length: 12 }).unique(),
});