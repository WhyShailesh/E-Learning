import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'learnova',
  password: process.env.DB_PASSWORD || '2223',
  port: parseInt(process.env.DB_PORT) || 5432,
});

async function run() {
  try {
    await pool.query('ALTER TABLE courses DROP COLUMN IF EXISTS category;');
    await pool.query('ALTER TABLE courses ADD COLUMN image_url TEXT;');
    console.log("DB updated!");
  } catch (err) {
    console.log("Error updating DB:", err.message);
  }
  process.exit(0);
}
run();
