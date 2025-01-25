import { sql } from "drizzle-orm";

export default async function (db) {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      business_name VARCHAR(255) NOT NULL CHECK (char_length(business_name) >= 3),
      business_type VARCHAR(255) NOT NULL CHECK (char_length(business_type) >= 3),
      email VARCHAR(255) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
      phone_number VARCHAR(10) NOT NULL UNIQUE CHECK (phone_number ~ '^9[0-9]{9}$'),
      pan_number VARCHAR(12) NOT NULL UNIQUE CHECK (pan_number ~ '^[0-9]+$'),
      password VARCHAR(255) NOT NULL CHECK (
        password ~ '(?=.*[A-Za-z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}'
      )
    );
  `);
}
