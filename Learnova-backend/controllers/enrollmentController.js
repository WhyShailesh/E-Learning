import pool from "../config/db.js";

export const enrollCourse = async (req, res) => {
  try {
    const { course_id, payment_id } = req.body;
    if (!course_id) return res.status(400).json({ message: "course_id is required" });

    const existing = await pool.query(
      "SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2",
      [req.user.id, course_id]
    );

    if (existing.rows.length) {
      return res.json(existing.rows[0]);
    }

    const result = await pool.query(
      `INSERT INTO enrollments (user_id, course_id, status, payment_id, enrolled_at)
       VALUES ($1, $2, 'in_progress', $3, NOW())
       RETURNING *`,
      [req.user.id, course_id, payment_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyEnrollments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, c.title, c.thumbnail, c.description
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = $1
       ORDER BY e.id DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCourseParticipants = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await pool.query(
      `SELECT e.*, u.id AS user_id, u.name, u.email
       FROM enrollments e
       JOIN users u ON u.id = e.user_id
       WHERE e.course_id = $1
       ORDER BY e.id DESC`,
      [courseId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
