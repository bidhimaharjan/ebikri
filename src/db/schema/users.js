import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  businessName: varchar({ length: 255 }).notNull(),

  businessType: varchar({ length: 255 }).notNull(),

  email: varchar({ length: 255 }).notNull().unique(),

  phoneNumber: varchar({ length: 10 }).notNull().unique(),

  panNumber: varchar({ length: 12 }).notNull().unique(),

  password: varchar({ length: 255 }).notNull(),
});
