import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  name: varchar({ length: 255 }).notNull(),

  phoneNumber: varchar({ length: 10 }).notNull().unique(),

  email: varchar({ length: 255 }).notNull().unique(),

  password: varchar({ length: 255 }).notNull(),
});
