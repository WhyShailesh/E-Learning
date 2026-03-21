import pool from "../config/db.js";

const requiredTables = [
  "users",
  "courses",
  "lessons",
  "quizzes",
  "questions",
  "options",
  "enrollments",
  "progress",
  "quiz_attempts",
  "payments",
];

async function verifyDb() {
  const tablesRes = await pool.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = ANY($1::text[])
     ORDER BY table_name`,
    [requiredTables]
  );

  const found = tablesRes.rows.map((r) => r.table_name);
  const missing = requiredTables.filter((t) => !found.includes(t));

  const adminRes = await pool.query(
    "SELECT email, role FROM users WHERE email = 'admin@gmail.com' LIMIT 1"
  );

  console.log("Found tables:", found.join(", "));
  console.log("Missing tables:", missing.length ? missing.join(", ") : "none");
  console.log(
    "Admin user:",
    adminRes.rows.length ? `${adminRes.rows[0].email} (${adminRes.rows[0].role})` : "missing"
  );
}

verifyDb()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
