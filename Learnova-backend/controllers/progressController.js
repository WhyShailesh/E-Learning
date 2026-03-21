import pool from "../config/db.js";

export const upsertLessonProgress = async (req, res) => {
  try {
    const { course_id, lesson_id, completed = true } = req.body;
    if (!course_id || !lesson_id) {
      return res.status(400).json({ message: "course_id and lesson_id are required" });
    }

    const enrollment = await pool.query(
      "SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2",
      [req.user.id, course_id]
    );
    if (!enrollment.rows.length) {
      return res.status(403).json({ message: "You must be enrolled to update progress" });
    }

    const result = await pool.query(
      `INSERT INTO progress (user_id, course_id, lesson_id, completed, completed_at)
       VALUES ($1, $2, $3, $4, CASE WHEN $4 THEN NOW() ELSE NULL END)
       ON CONFLICT (user_id, lesson_id)
       DO UPDATE SET completed = EXCLUDED.completed, completed_at = EXCLUDED.completed_at
       RETURNING *`,
      [req.user.id, course_id, lesson_id, completed]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const totalLessonsRes = await pool.query("SELECT COUNT(*)::int AS total FROM lessons WHERE course_id = $1", [
      courseId,
    ]);
    const completedRes = await pool.query(
      `SELECT COUNT(*)::int AS completed
       FROM progress
       WHERE user_id = $1 AND course_id = $2 AND completed = true`,
      [req.user.id, courseId]
    );
    const detailsRes = await pool.query(
      "SELECT lesson_id, completed, completed_at FROM progress WHERE user_id = $1 AND course_id = $2",
      [req.user.id, courseId]
    );

    const total = totalLessonsRes.rows[0]?.total || 0;
    const completed = completedRes.rows[0]?.completed || 0;
    const completion_percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.json({ total, completed, completion_percent, lessons: detailsRes.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
