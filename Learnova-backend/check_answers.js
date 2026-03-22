import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'learnova',
  password: '2223',
  port: 5432,
});

async function main() {
  try {
    const res = await pool.query(`
      SELECT qq.quiz_id, qq.id as q_id, qo.id as opt_id, qo.option_text, qo.is_correct
      FROM quiz_questions qq
      JOIN quiz_options qo ON qq.id = qo.question_id
      WHERE qq.quiz_id = 2;
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } finally {
    pool.end();
  }
}
main();
