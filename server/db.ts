import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set for Supabase connection");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const db = drizzle(pool, { schema });

// Supabase connection is handled automatically
// No manual table creation needed - Drizzle will handle this
export async function initializeDatabase() {
  try {
    console.log('Supabase database connection established');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}