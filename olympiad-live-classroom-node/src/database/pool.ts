import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://olympiad_user:olympiad_password_2026@localhost:5432/olympiad_classroom',
});

export async function closePool() {
  await pool.end();
}
