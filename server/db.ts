import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "../shared/schema.js";

// Use in-memory SQLite for development
const sqlite = new Database(':memory:');
export const db = drizzle(sqlite, { schema });