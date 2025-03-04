import { numeric, integer, pgTable, varchar, date, text } from "drizzle-orm/pg-core";
import { orderTable } from "./order";

export const paymentTable = pgTable("payment", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  orderId: integer()
    .notNull()
    .references(() => orderTable.id, { onDelete: "cascade" }),

  pidx: varchar({ length: 255 }).notNull(), // payment ID from Khalti

  transactionId: varchar({ length: 255 }), // transaction ID from Khalti

  amount: numeric(10, 2).notNull(), // amount paid

  status: varchar({ length: 50 }).notNull(), // payment status ("pending", "completed", "failed")

  paymentDate: date("payment_date").notNull(), // date of payment

  paymentMethod: varchar({ length: 50 }).notNull(), // payment method (e.g., "Khalti")

  paymentDetails: text(), // additional payment details (e.g., raw response from Khalti)
});