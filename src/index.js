import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { usersTable } from "./db/schema/users";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle({ client: sql });

export async function createUser() {
  const user = {
    businessName: "Zara",
    businessType: "Fashion",
    email: "zara@gmail.com",
    phoneNumber: "9841000000",
    panNumber: "1234567890",
    password: "zara@123",
  };
  await db.insert(usersTable).values(user);
  console.log("New user created!");
  const users = await db.select().from(usersTable);
  console.log("Getting all users from the database: ", users);
}

