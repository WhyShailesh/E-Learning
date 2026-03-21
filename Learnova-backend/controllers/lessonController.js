import pool from "../config/db.js";

// CREATE LESSON
export const createLesson = async (req, res) => {
  try {
    const { course_id, title, type = "video", content_url = null, description = null } = req.body;
    if (!course_id || !title) return res.status(400).json({ message: "course_id and title are required" });

    const courseRes = await pool.query("SELECT * FROM courses WHERE id = $1", [course_id]);
    if (!courseRes.rows.length) return res.status(404).json({ message: "Course not found" });
    const course = courseRes.rows[0];
    if (req.user.role !== "admin" && course.instructor_id !== req.user.id) {
      return res.status(403).json({ message: "You can only add lessons to your own course" });
    }

    const result = await pool.query(
      "INSERT INTO lessons (course_id, title, type, content_url, description) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [course_id, title, type, content_url, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET LESSONS BY COURSE
export const getLessons = async (req, res) => {
  try {
    const { courseId } = req.params;

    const result = await pool.query(
      "SELECT * FROM lessons WHERE course_id = $1",
      [courseId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lessonRes = await pool.query("SELECT * FROM lessons WHERE id = $1", [lessonId]);
    if (!lessonRes.rows.length) return res.status(404).json({ message: "Lesson not found" });

    const lesson = lessonRes.rows[0];
    const courseRes = await pool.query("SELECT * FROM courses WHERE id = $1", [lesson.course_id]);
    const course = courseRes.rows[0];
    if (req.user.role !== "admin" && course.instructor_id !== req.user.id) {
      return res.status(403).json({ message: "You can only delete lessons from your own course" });
    }

    await pool.query("DELETE FROM lessons WHERE id = $1", [lessonId]);
    res.json({ message: "Lesson deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};