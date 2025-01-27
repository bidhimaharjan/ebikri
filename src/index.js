import { config } from 'dotenv';
config();

import pg from 'pg'; // import the pg module using default import
const { Pool } = pg;

import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

import { usersTable } from "./db/schema/users.js";
import { inventoryTable } from "./db/schema/inventory.js";

// create a new Pool using DATABASE_URL from the environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// console.log('Database URL:', process.env.DATABASE_URL);

// create the drizzle db instance using the pool
const db = drizzle(pool);

// test the connection using drizzle
async function testConnection() {
  try {
    // execute a simple query to confirm connection
    const result = await db.execute(sql`SELECT NOW()`);
    console.log('Connected to the database successfully:', result.rows[0].now);
  } catch (err) {
    console.error('Error connecting to the database with drizzle', err);
  }
}

testConnection();

// export the db instance so it can be used in other files
export { db };

// for neondb
// import { drizzle } from "drizzle-orm/neon-http";
// import { neon } from "@neondatabase/serverless";

// for neondb
// const sql = neon(process.env.DATABASE_URL);
// export const db = drizzle({ client: sql });