import pool from "../config/db.js";

export const learnerDashboard = async (req, res) => {
  try {
    const myCourses = await pool.query(
      `SELECT e.course_id, e.status, c.title, c.thumbnail, c.description
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = $1`,
      [req.user.id]
    );
    res.json({ my_courses: myCourses.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const instructorDashboard = async (req, res) => {
  try {
    // Fetch all courses for this instructor via all assignment pathways:
    // 1. courses.instructor_id (direct)
    // 2. instructor_courses.user_id (users-table instructors)
    // 3. instructor_courses.instructor_id (instructors-table entries)
    const courses = await pool.query(
      `SELECT DISTINCT ON (c.id) c.*
       FROM courses c
       WHERE c.instructor_id = $1
          OR EXISTS (
            SELECT 1 FROM instructor_courses ic
            WHERE ic.course_id = c.id
              AND (ic.user_id = $1 OR ic.instructor_id = $1)
          )
       ORDER BY c.id DESC`,
      [req.user.id]
    );
    const courseIds = courses.rows.map((row) => row.id);
    let enrollments = [];
    if (courseIds.length) {
      const participants = await pool.query(
        `SELECT e.*, u.name, u.email
         FROM enrollments e
         JOIN users u ON u.id = e.user_id
         WHERE e.course_id = ANY($1::int[])`,
        [courseIds]
      );
      enrollments = participants.rows;
    }
    res.json({ courses: courses.rows, enrollments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const adminDashboard = async (_req, res) => {
  try {
    const users = await pool.query("SELECT COUNT(*)::int AS total FROM users");
    const courses = await pool.query("SELECT COUNT(*)::int AS total FROM courses");
    const completed = await pool.query(
      "SELECT COUNT(*)::int AS total FROM enrollments WHERE status = 'completed'"
    );
    const inProgress = await pool.query(
      "SELECT COUNT(*)::int AS total FROM enrollments WHERE status = 'in_progress'"
    );
    res.json({
      total_users: users.rows[0].total,
      total_courses: courses.rows[0].total,
      completed_courses: completed.rows[0].total,
      in_progress_courses: inProgress.rows[0].total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
