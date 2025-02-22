import { integer, pgTable, varchar, date } from "drizzle-orm/pg-core";
import { businessTable } from "./business";

export const customerTable = pgTable("customer", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  businessId: integer().notNull().references(() => businessTable.id, { onDelete: "cascade" }),

  name: varchar({ length: 255 }).notNull(),

  phoneNumber: varchar({ length: 10 }).notNull().unique(),

  email: varchar({ length: 255 }).notNull().unique(),

  addedDate: date("added_date").notNull(),

  totalOrders: integer().notNull(),
});