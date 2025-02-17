import { numeric, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { orderTable } from "./order";
import { productTable } from "./product";

export const orderProductTable = pgTable("orderproduct", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  orderId: integer().notNull().references(() => orderTable.id, { onDelete: "cascade" }),

  productId: integer().notNull().references(() => productTable.id, { onDelete: "cascade" }),

  quantity: integer().notNull(),

  unitPrice: numeric(10, 2).notNull(),

  amount: numeric(10, 2).notNull(),
});