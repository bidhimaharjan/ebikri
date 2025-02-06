import { numeric, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { businessTable } from "./business";

export const inventoryTable = pgTable("inventory", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  businessId: integer().notNull().references(() => businessTable.id, { onDelete: "cascade" }),

  productName: varchar({ length: 255 }).notNull(),

  stockAvailability: integer().notNull(),

  unitPrice: numeric(10, 2).notNull(),
});