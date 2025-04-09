import { numeric, integer, pgTable, date } from "drizzle-orm/pg-core";
import { businessTable } from "./business";
import { orderTable } from "./order";
import { productTable } from "./product";

export const salesTable = pgTable("sales", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  businessId: integer().notNull().references(() => businessTable.id, { onDelete: "cascade" }),

  orderId: integer().notNull().references(() => orderTable.id, { onDelete: "cascade" }),

  productId: integer().notNull().references(() => productTable.id, { onDelete: "cascade" }),

  quantitySold: integer().notNull(),

  revenue: numeric(10, 2).notNull(),

  saleDate: date("sale_date").notNull(),

  discountAmount: numeric(10, 2).default(0),
});