import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set for PostgreSQL connection");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Remove SSL for local PostgreSQL
});

export const db = drizzle(pool, { schema });

export async function initializeDatabase() {
  try {
    // Test the connection
    await pool.query('SELECT NOW()');
    console.log('PostgreSQL database connection established');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}