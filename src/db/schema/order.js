import { numeric, integer, pgTable, varchar, date } from "drizzle-orm/pg-core";
import { businessTable } from "./business";

export const orderTable = pgTable("order", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  businessId: integer().notNull().references(() => businessTable.id, { onDelete: "cascade" }),

  customerName: varchar({ length: 255 }).notNull(),

  phoneNumber: varchar({ length: 10 }).notNull(),

  deliveryLocation: varchar({ length: 255 }).notNull(),

  email: varchar({ length: 255 }).notNull(),

  totalAmount: numeric(10, 2).notNull(),

  orderDate: date("order_date").notNull(),
});