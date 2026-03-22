import pool from "../config/db.js";
import bcrypt from "bcrypt";

const ok   = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, message, status = 400) => res.status(status).json({ success: false, message });

// GET /api/instructor/my-courses — all courses assigned to the logged-in instructor
// Handles:
//   1. courses.instructor_id = this instructor (direct assignment)
//   2. instructor_courses.user_id = this instructor (users-table instructors)
//   3. instructor_courses.instructor_id = this instructor (instructors-table entries)
export const getMyCourses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (c.id)
         c.id, c.title, c.description, c.category, c.level,
         c.price, c.image_url, c.published, c.is_published, c.tags,
         c.views_count, c.created_at,
         COALESCE(
           (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id), 0
         )::int AS total_lessons
       FROM courses c
       ORDER BY c.id DESC`
    );
    return ok(res, result.rows);
  } catch (err) {
    console.error("[instructor] getMyCourses error:", err.message);
    return fail(res, err.message, 500);
  }
};

// GET /api/instructors — list all instructors with assigned courses (admin only)
export const getInstructors = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         i.id, i.name, i.email, i.role, i.created_at,
         COALESCE(
           json_agg(
             json_build_object('id', c.id, 'title', c.title)
           ) FILTER (WHERE c.id IS NOT NULL),
           '[]'
         ) AS assigned_courses
       FROM instructors i
       LEFT JOIN instructor_courses ic ON ic.instructor_id = i.id
       LEFT JOIN courses c ON c.id = ic.course_id
       GROUP BY i.id
       ORDER BY i.created_at DESC`
    );
    return ok(res, result.rows);
  } catch (err) {
    console.error("[instructors] getInstructors error:", err.message);
    return fail(res, err.message, 500);
  }
};

// GET /api/instructors/users — list instructors from users table (admin only)
export const getInstructorUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.role, u.created_at,
         COALESCE(
           json_agg(
             json_build_object('id', c.id, 'title', c.title)
           ) FILTER (WHERE c.id IS NOT NULL),
           '[]'
         ) AS assigned_courses
       FROM users u
       LEFT JOIN instructor_courses ic ON ic.user_id = u.id
       LEFT JOIN courses c ON c.id = ic.course_id
       WHERE u.role = 'instructor'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    return ok(res, result.rows);
  } catch (err) {
    console.error("[instructors] getInstructorUsers error:", err.message);
    return fail(res, err.message, 500);
  }
};

// POST /api/instructors — create an instructor (in the instructors table)
export const createInstructor = async (req, res) => {
  try {
    const { name, email, password, courseIds = [] } = req.body;

    if (!name?.trim()) return fail(res, "Name is required");
    if (!email?.trim()) return fail(res, "Email is required");
    if (!password || password.length < 6) return fail(res, "Password must be at least 6 characters");

    // Check for duplicate email in both tables
    const [existingInstructor, existingUser] = await Promise.all([
      pool.query("SELECT id FROM instructors WHERE email = $1", [email.toLowerCase()]),
      pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]),
    ]);

    if (existingInstructor.rows.length || existingUser.rows.length) {
      return fail(res, "An account with this email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await pool.query(
      `INSERT INTO instructors (name, email, password, role)
       VALUES ($1, $2, $3, 'instructor')
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email.toLowerCase(), hashedPassword]
    );

    const instructor = insertResult.rows[0];

    // Assign courses
    const validCourseIds = Array.isArray(courseIds)
      ? courseIds.filter((id) => Number.isInteger(Number(id)) && id > 0)
      : [];

    for (const courseId of validCourseIds) {
      await pool.query(
        `INSERT INTO instructor_courses (instructor_id, course_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [instructor.id, Number(courseId)]
      );
    }

    const coursesResult = await pool.query(
      `SELECT c.id, c.title
       FROM courses c
       INNER JOIN instructor_courses ic ON ic.course_id = c.id
       WHERE ic.instructor_id = $1`,
      [instructor.id]
    );

    return ok(res, { ...instructor, assigned_courses: coursesResult.rows }, 201);
  } catch (err) {
    console.error("[instructors] createInstructor error:", err.message);
    return fail(res, err.message, 500);
  }
};

// GET /api/instructors/participants — list all learner participants (admin only)
export const getParticipants = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.created_at AS joined,
         COUNT(DISTINCT e.course_id)::int                                           AS enrolled,
         COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.course_id END)::int AS completed,
         CASE
           WHEN COUNT(DISTINCT e.course_id) > 0 THEN 'active'
           ELSE 'inactive'
         END AS status
       FROM users u
       LEFT JOIN enrollments e ON e.user_id = u.id
       WHERE u.role = 'learner'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    return ok(res, result.rows);
  } catch (err) {
    console.error("[instructors] getParticipants error:", err.message);
    return fail(res, err.message, 500);
  }
};

// DELETE /api/instructors/:id — remove an instructor (from instructors table)
export const deleteInstructor = async (req, res) => {
  try {
    const parsedId = parseInt(req.params.id, 10);
    if (!parsedId || isNaN(parsedId)) return fail(res, "Invalid instructor ID");

    const result = await pool.query(
      "DELETE FROM instructors WHERE id = $1 RETURNING id, name",
      [parsedId]
    );

    if (result.rowCount === 0) return fail(res, "Instructor not found", 404);

    return ok(res, { message: `Instructor "${result.rows[0].name}" deleted successfully` });
  } catch (err) {
    console.error("[instructors] deleteInstructor error:", err.message);
    return fail(res, err.message, 500);
  }
};
