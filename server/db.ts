import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "../shared/schema";

// Get DATABASE_URL from environment variables
function constructDatabaseUrl() {
  // Use the provided Supabase connection string
  const supabaseConnectionString = 'postgresql://postgres.qaskgmrxnxykmougppzk:Kenylson%4023@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
  
  // Set as environment variable for drizzle-kit
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = supabaseConnectionString;
  }
  
  return process.env.DATABASE_URL;
}

const databaseUrl = constructDatabaseUrl();

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function createDatabaseConnection() {
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    db = drizzle(pool, { schema });
  }
  return { pool, db };
}

export { db };
export function getDb() {
  if (!db) {
    const conn = createDatabaseConnection();
    return conn.db!;
  }
  return db;
}

export async function initializeDatabase() {
  try {
    console.log('Attempting to connect to database...');
    const { pool: dbPool } = createDatabaseConnection();
    if (!dbPool) {
      throw new Error('Failed to create database pool');
    }
    
    // Test the connection with a simple query
    const result = await dbPool.query('SELECT NOW() as current_time');
    console.log('PostgreSQL database connection established at:', result.rows[0].current_time);
    
    // Check if this is a Supabase connection
    const isSupabase = databaseUrl.includes('supabase.com');
    if (isSupabase) {
      console.log('✓ Supabase database connection established');
      
      // Verify essential tables exist
      const tableCheck = await dbPool.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name IN ('users', 'products', 'contact_messages', 'fan_photos')
      `);
      console.log(`✓ Essential tables verified: ${tableCheck.rows.map(r => r.table_name).join(', ')}`);
    }
    
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    console.error('Connection string format:', databaseUrl.replace(/:[^:@]*@/, ':***@'));
    console.log('PostgreSQL unavailable - application will use memory storage fallback');
    return false;
  }
}