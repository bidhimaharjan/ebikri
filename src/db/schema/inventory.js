import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const inventoryTable = pgTable("inventory", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
});