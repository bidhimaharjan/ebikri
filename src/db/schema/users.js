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

// export const usersTable = pgTable("users", {
//   id: integer().primaryKey().generatedAlwaysAsIdentity(),

//   businessName: varchar({ length: 255 }).notNull().check("business_name_length", "char_length(businessName) >= 3"),

//   businessType: varchar({ length: 255 }).notNull().check("business_type_length", "char_length(businessType) >= 3"),

//   email: varchar({ length: 255 }).notNull().unique().check("email_format", "email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'"),

//   phoneNumber: varchar({ length: 10 }).notNull().unique().check("phone_number_format", "phoneNumber ~ '^[0-9]+$'"),

//   panNumber: varchar({ length: 12 }).notNull().unique().check("pan_number_format", "panNumber ~ '^[0-9]+$'"),

//   password: varchar({ length: 255 }).notNull().check("password_length", "char_length(password) >= 8"),
// });