import pool from "../config/db.js";
import bcrypt from "bcrypt";

async function run(sql, label = "") {
  try {
    await pool.query(sql);
  } catch (err) {
    // Silently suppress non-critical migration errors (DDL is idempotent)
    // Only log truly unexpected errors for diagnostics
    const msg = err.message || "";
    if (
      !msg.includes("already exists") &&
      !msg.includes("does not exist") &&
      !msg.includes("duplicate") &&
      !msg.includes("multiple primary keys") &&
      !msg.includes("violates not-null") &&
      !msg.includes("violates unique")
    ) {
      console.warn(`[DB] Migration warning${label ? " (" + label + ")" : ""}: ${msg}`);
    }
  }
}

export async function setupDatabase() {
  // ── Core tables ───────────────────────────────────────────────────────────
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
      image_url TEXT,
      difficulty VARCHAR(50),
      instructor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      is_published BOOLEAN DEFAULT false,
      published BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS lessons (
      id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      title VARCHAR(255),
      type VARCHAR(20) CHECK (type IN ('video', 'document', 'image', 'quiz')),
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

  // Separate instructors table (for admin-panel created instructors)
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

  // ── instructor_courses: supports BOTH instructors table and users table ──
  // We use two nullable FK columns — only one will be set per row
  await run(`
    CREATE TABLE IF NOT EXISTS instructor_courses (
      id SERIAL PRIMARY KEY,
      instructor_id INTEGER REFERENCES instructors(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      UNIQUE (instructor_id, course_id),
      UNIQUE (user_id, course_id),
      CHECK (
        (instructor_id IS NOT NULL AND user_id IS NULL) OR
        (instructor_id IS NULL AND user_id IS NOT NULL)
      )
    );
  `);

  // ── A1-A5: Extended course columns ───────────────────────────────────────
  await run(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;`);
  await run(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0;`);
  await run(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail TEXT;`);
  await run(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(100);`);
  await run(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS level VARCHAR(50);`);
  await run(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags TEXT[];`);
  await run(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;`);
  await run(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'everyone';`);
  await run(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS access_rule VARCHAR(20) DEFAULT 'open';`);
  await run(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_image TEXT;`);
  await run(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS website_id INTEGER;`);
  await run(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS responsible_id INTEGER;`);
  await run(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;`);

  // ── A3-A4: Extended lesson columns ────────────────────────────────────────
  await run(`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS description TEXT;`);
  await run(`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0;`);
  await run(`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;`);

  // Fix lesson type check to include quiz (if constraint doesn't already include it)
  await run(`ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_type_check;`);
  await run(`ALTER TABLE lessons ADD CONSTRAINT lessons_type_check CHECK (type IN ('video', 'document', 'image', 'quiz'));`);

  // ── Enrollment / Progress compat columns ──────────────────────────────────
  await run(`ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
  await run(`ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS payment_id TEXT;`);
  await run(`ALTER TABLE progress ADD COLUMN IF NOT EXISTS course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE;`);
  await run(`ALTER TABLE progress ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;`);

  // ── instructor_courses: add user_id column to existing table if missing ───
  await run(`ALTER TABLE instructor_courses ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;`);
  await run(`ALTER TABLE instructor_courses ADD COLUMN IF NOT EXISTS id SERIAL;`, "add id col");

  // Make instructor_id nullable on existing installations
  await run(`ALTER TABLE instructor_courses ALTER COLUMN instructor_id DROP NOT NULL;`);

  // ── websites (A2 — website_id FK) ─────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS websites (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ── course_attendees (A2) ─────────────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS course_attendees (
      id SERIAL PRIMARY KEY,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (course_id, user_id)
    );
  `);

  // ── lesson_content (A4) ───────────────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS lesson_content (
      id SERIAL PRIMARY KEY,
      lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE UNIQUE,
      video_url TEXT,
      document_url TEXT,
      image_url TEXT,
      allow_download BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ── lesson_descriptions (A4) ──────────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS lesson_descriptions (
      id SERIAL PRIMARY KEY,
      lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ── lesson_attachments (A4) ───────────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS lesson_attachments (
      id SERIAL PRIMARY KEY,
      lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      type VARCHAR(10) CHECK (type IN ('file', 'link')) DEFAULT 'file',
      file_url TEXT,
      external_link TEXT,
      label VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ── quiz_questions (A7) ───────────────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id SERIAL PRIMARY KEY,
      quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ── quiz_options (A7) ─────────────────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS quiz_options (
      id SERIAL PRIMARY KEY,
      question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
      option_text TEXT NOT NULL,
      is_correct BOOLEAN DEFAULT false
    );
  `);

  // ── quiz_rewards (A7) ─────────────────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS quiz_rewards (
      id SERIAL PRIMARY KEY,
      quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE UNIQUE,
      first_try_points INTEGER DEFAULT 0,
      second_try_points INTEGER DEFAULT 0,
      third_try_points INTEGER DEFAULT 0,
      fourth_try_points INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ── course_progress (A8) ──────────────────────────────────────────────────
  await run(`
    CREATE TABLE IF NOT EXISTS course_progress (
      id SERIAL PRIMARY KEY,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      enrolled_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      start_date TIMESTAMP,
      time_spent INTEGER DEFAULT 0,
      completion_percentage NUMERIC(5,2) DEFAULT 0,
      completed_date TIMESTAMP,
      status VARCHAR(20) CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
      UNIQUE (course_id, user_id)
    );
  `);

  // ── Indexes ───────────────────────────────────────────────────────────────
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS enrollments_user_course_uidx ON enrollments(user_id, course_id);`);
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS progress_user_lesson_uidx ON progress(user_id, lesson_id);`);
  await run(`CREATE INDEX IF NOT EXISTS idx_course_progress_course ON course_progress(course_id);`);
  await run(`CREATE INDEX IF NOT EXISTS idx_course_progress_user ON course_progress(user_id);`);
  await run(`CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);`);
  await run(`CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);`);

  // ── Data migrations ───────────────────────────────────────────────────────
  await run(`UPDATE instructors SET role = 'instructor' WHERE role = 'course_manager';`);

  // Sync is_published <-> published (either true → both true)
  await run(`
    UPDATE courses
    SET published    = CASE WHEN (is_published = true OR published = true) THEN true ELSE false END,
        is_published = CASE WHEN (is_published = true OR published = true) THEN true ELSE false END;
  `);

  // Backfill instructor_courses for existing courses with instructor_id set
  // This populates user_id column for courses owned by users-table instructors
  await run(`
    INSERT INTO instructor_courses (user_id, course_id)
    SELECT c.instructor_id, c.id
    FROM courses c
    WHERE c.instructor_id IS NOT NULL
      AND EXISTS (SELECT 1 FROM users u WHERE u.id = c.instructor_id AND u.role = 'instructor')
      AND NOT EXISTS (
        SELECT 1 FROM instructor_courses ic
        WHERE ic.user_id = c.instructor_id AND ic.course_id = c.id
      );
  `);

  // Seed course_progress from existing enrollments
  await run(`
    INSERT INTO course_progress (course_id, user_id, enrolled_date, status)
    SELECT e.course_id, e.user_id, COALESCE(e.enrolled_at, e.created_at), 'not_started'
    FROM enrollments e
    WHERE NOT EXISTS (
      SELECT 1 FROM course_progress cp
      WHERE cp.course_id = e.course_id AND cp.user_id = e.user_id
    );
  `);

  // ── Default admin ─────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("admin", 10);
  await pool.query(
    `INSERT INTO users (name, email, password, role)
     SELECT 'Admin', 'admin@gmail.com', $1, 'admin'
     WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@gmail.com');`,
    [hashedPassword]
  );

  console.log("[DB] Schema setup complete — all tables, columns, and indexes ready.");
}
