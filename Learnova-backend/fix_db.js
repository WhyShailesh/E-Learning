import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'learnova',
  password: '2223',
  port: 5432,
});

async function run() {
  try {
    console.log("Removing duplicate quiz attempts...");
    
    // Keep only the most recent attempt for each user/quiz combination
    await pool.query(`
      DELETE FROM quiz_attempts a USING (
        SELECT MAX(id) as max_id, user_id, quiz_id
        FROM quiz_attempts 
        GROUP BY user_id, quiz_id
      ) b
      WHERE a.user_id = b.user_id 
        AND a.quiz_id = b.quiz_id 
        AND a.id < b.max_id;
    `);

    console.log("Checking if constraint exists...");
    const conRes = await pool.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'quiz_attempts'::regclass
      AND conname = 'quiz_attempts_user_id_quiz_id_key';
    `);

    if (conRes.rows.length === 0) {
      console.log("Adding UNIQUE constraint...");
      await pool.query(`
        ALTER TABLE quiz_attempts
        ADD CONSTRAINT quiz_attempts_user_id_quiz_id_key UNIQUE (user_id, quiz_id);
      `);
      console.log("Successfully added constraint.");
    } else {
      console.log("Constraint already exists.");
    }
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    pool.end();
  }
}

run();
