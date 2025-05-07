import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const passwordResetTokensTable = pgTable("password_reset_tokens", {
  id: varchar('id').primaryKey(),

  userId: varchar('userId').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),

  token: varchar('token').notNull().unique(),

  expiresAt: timestamp('expires_at').notNull(),
});