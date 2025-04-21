import { boolean, pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: varchar('id').primaryKey(),

  name: varchar({ length: 255 }).notNull(),

  phoneNumber: varchar({ length: 10 }).unique(),

  email: varchar({ length: 255 }).notNull().unique(),

  password: varchar({ length: 255 }),

  emailVerified: timestamp('email_verified'),

  image: text('image'), // for storing Google profile picture

  provider: text('provider'), // 'credentials' or 'google'

  requiresProfileCompletion: boolean('requires_profile_completion').notNull().default(true)
});
