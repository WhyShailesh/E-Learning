import pool from "../config/db.js";
import bcrypt from "bcrypt";

async function run(sql) {
  await pool.query(sql);
}

export async function setupDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(20) CHECK (role IN ('admin', 'instructor', 'learner')) DEFAULT 'learner',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      is_published BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS lessons (
      id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      title VARCHAR(255),
      type VARCHAR(20) CHECK (type IN ('video', 'document', 'image')),
      content_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      title VARCHAR(255)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
      question TEXT NOT NULL
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS options (
      id SERIAL PRIMARY KEY,
      question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
      option_text TEXT,
      is_correct BOOLEAN DEFAULT false
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      status VARCHAR(20) DEFAULT 'in_progress',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
      completed BOOLEAN DEFAULT false
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
      score INTEGER,
      attempt_number INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      course_id INTEGER REFERENCES courses(id),
      razorpay_payment_id TEXT,
      razorpay_order_id TEXT,
      amount INTEGER,
      status VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Dedicated instructors table
  await run(`
    CREATE TABLE IF NOT EXISTS instructors (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(20) DEFAULT 'instructor',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Join table: which courses are assigned to which instructor
  await run(`
    CREATE TABLE IF NOT EXISTS instructor_courses (
      instructor_id INTEGER NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      PRIMARY KEY (instructor_id, course_id)
    );
  `);

  // Compatibility columns used by current backend APIs.
  await run(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;`);
  await run(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0;`);
  await run(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail TEXT;`);
  await run(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(100);`);
  await run(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS level VARCHAR(50);`);

  await run(`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS description TEXT;`);

  await run(`ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
  await run(`ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS payment_id TEXT;`);

  await run(`ALTER TABLE progress ADD COLUMN IF NOT EXISTS course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE;`);
  await run(`ALTER TABLE progress ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;`);

  await run(`CREATE UNIQUE INDEX IF NOT EXISTS enrollments_user_course_uidx ON enrollments(user_id, course_id);`);
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS progress_user_lesson_uidx ON progress(user_id, lesson_id);`);

  // Fix legacy role value: course_manager → instructor
  await run(`UPDATE instructors SET role = 'instructor' WHERE role = 'course_manager';`);

  // Keep is_published and published in sync for mixed query usage.
  await run(`
    UPDATE courses
    SET published = COALESCE(published, is_published, false),
        is_published = COALESCE(is_published, published, false);
  `);

  const hashedPassword = await bcrypt.hash("admin", 10);
  await pool.query(
    `
    INSERT INTO users (name, email, password, role)
    SELECT 'Admin', 'admin@gmail.com', $1, 'admin'
    WHERE NOT EXISTS (
      SELECT 1 FROM users WHERE email = 'admin@gmail.com'
    );
  `,
    [hashedPassword]
  );
}
