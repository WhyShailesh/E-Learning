import pool from "../config/db.js";
import bcrypt from "bcrypt";

// GET /api/instructors — list all instructors with assigned courses
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
    res.json(result.rows);
  } catch (err) {
    console.error("[instructors] getInstructors error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/instructors — create an instructor
export const createInstructor = async (req, res) => {
  try {
    const { name, email, password, courseIds = [] } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check for duplicate email
    const existing = await pool.query(
      "SELECT id FROM instructors WHERE email = $1",
      [email.toLowerCase()]
    );
    if (existing.rows.length) {
      return res.status(409).json({ message: "An instructor with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await pool.query(
      `INSERT INTO instructors (name, email, password, role)
       VALUES ($1, $2, $3, 'course_manager')
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
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [instructor.id, Number(courseId)]
      );
    }

    // Fetch assigned courses for response
    const coursesResult = await pool.query(
      `SELECT c.id, c.title
       FROM courses c
       INNER JOIN instructor_courses ic ON ic.course_id = c.id
       WHERE ic.instructor_id = $1`,
      [instructor.id]
    );

    res.status(201).json({
      ...instructor,
      assigned_courses: coursesResult.rows,
    });
  } catch (err) {
    console.error("[instructors] createInstructor error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/instructors/:id — remove an instructor
export const deleteInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (!parsedId || isNaN(parsedId)) {
      return res.status(400).json({ message: "Invalid instructor ID" });
    }

    // instructor_courses rows are deleted automatically via CASCADE
    const result = await pool.query(
      "DELETE FROM instructors WHERE id = $1 RETURNING id, name",
      [parsedId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.json({ message: `Instructor "${result.rows[0].name}" deleted successfully` });
  } catch (err) {
    console.error("[instructors] deleteInstructor error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
