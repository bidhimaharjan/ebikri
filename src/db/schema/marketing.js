import { integer, text, boolean, numeric, pgTable, date } from "drizzle-orm/pg-core";
import { businessTable } from "./business";

export const marketingTable = pgTable("marketing", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  businessId: integer().notNull().references(() => businessTable.id, { onDelete: "cascade" }),

  campaignName: text().notNull(),

  discountPercent: numeric(5, 2).notNull(),

  recipients: text().notNull().default("all"),

  promoCode: text().unique().notNull(),

  startDate: date("start_date").notNull(),

  endDate: date("end_date").notNull(),

  active: boolean().default(false),
});
