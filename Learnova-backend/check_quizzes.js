import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'learnova',
  password: '2223',
  port: 5432,
});

async function test() {
  try {
    const res = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_name = 'quiz_attempts'`);
    if (res.rows.length === 0) {
       console.log("quiz_attempts DOES NOT EXIST!");
    } else {
       console.log("quiz_attempts EXISTS.");
       const attempts = await pool.query(`SELECT * FROM quiz_attempts LIMIT 5`);
       console.log(attempts.rows);
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

test();
