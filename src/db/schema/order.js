import { numeric, integer, pgTable, varchar, date } from "drizzle-orm/pg-core";
import { businessTable } from "./business";
import { customerTable } from "./customer";

export const orderTable = pgTable("order", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  businessId: integer().notNull().references(() => businessTable.id, { onDelete: "cascade" }),

  customerId: integer().notNull().references(() => customerTable.id, { onDelete: "cascade" }),

  customerName: varchar({ length: 255 }).notNull(),

  phoneNumber: varchar({ length: 10 }).notNull(),

  deliveryLocation: varchar({ length: 255 }).notNull(),

  email: varchar({ length: 255 }).notNull(),

  totalAmount: numeric(10, 2).notNull(),

  orderDate: date("order_date").notNull(),
});