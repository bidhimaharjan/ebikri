import { sql } from "drizzle-orm";

export default async function (db) {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS inventory (
      id SERIAL PRIMARY KEY
      )
    );
  `);
}
