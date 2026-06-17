import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const conn = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// CRITICAL FIX: Catch idle network disconnects so they don't crash the Node.js server!
conn.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client (Network Drop)', err);
});

export const db = drizzle(conn, { schema });
