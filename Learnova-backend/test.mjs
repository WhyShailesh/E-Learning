import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'learnova',
  password: '2223',
  port: 5432,
});

async function run() {
  const result = await pool.query("SELECT * FROM users WHERE email='admin@gmail.com'");
  if (result.rows.length === 0) {
    console.log("Admin not found!");
  } else {
    console.log("Admin found:", result.rows[0]);
    const valid = await bcrypt.compare('admin', result.rows[0].password);
    console.log("Password 'admin' is valid:", valid);
  }
  process.exit(0);
}
run();
