import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'learnova',
  password: '2223',
  port: 5432,
});

async function run() {
  const result = await pool.query('SELECT * FROM lessons ORDER BY id DESC LIMIT 5');
  console.log("Recent lessons:");
  console.dir(result.rows);
  process.exit(0);
}
run();
