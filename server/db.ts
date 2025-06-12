import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "../shared/schema";

// Get DATABASE_URL from environment variables
const databaseUrl = process.env.DATABASE_URL || 
                   process.env.PGDATABASE_URL || 
                   process.env.POSTGRES_URL ||
                   `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || ''}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'postgres'}`;

console.log('Attempting to connect to database...');

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });

export async function initializeDatabase() {
  try {
    // Test the connection with a simple query
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('PostgreSQL database connection established at:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    console.error('Connection string format:', databaseUrl.replace(/:[^:@]*@/, ':***@'));
    throw new Error(`Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}