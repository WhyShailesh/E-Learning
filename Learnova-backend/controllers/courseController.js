import pool from "../config/db.js";

// CREATE COURSE
export const createCourse = async (req, res) => {
  try {
    const { title, description, price = 0, thumbnail = null, category = null, level = null, published = false } =
      req.body;
    if (!title) return res.status(400).json({ message: "title is required" });

    const result = await pool.query(
      `INSERT INTO courses (title, description, instructor_id, price, thumbnail, category, level, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description || "", req.user.id, price, thumbnail, category, level, published]
    );

    const course = result.rows[0];

    // If created by an instructor (stored in instructors table),
    // link the new course to them in instructor_courses so ownership works.
    if (req.user.role === "instructor") {
      await pool.query(
        `INSERT INTO instructor_courses (instructor_id, course_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [req.user.id, course.id]
      );
    }

    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL COURSES
export const getCourses = async (req, res) => {
  try {
    const includeAll = req.query.includeAll === "true";
    const result = await pool.query(
      `SELECT c.*, u.name AS instructor_name
       FROM courses c
       LEFT JOIN users u ON u.id = c.instructor_id
       WHERE ($1::boolean = true OR c.published = true)
       ORDER BY c.id DESC`,
      [includeAll]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const courseRes = await pool.query(
      `SELECT c.*, u.name AS instructor_name
       FROM courses c
       LEFT JOIN users u ON u.id = c.instructor_id
       WHERE c.id = $1`,
      [id]
    );

    if (!courseRes.rows.length) return res.status(404).json({ message: "Course not found" });

    const lessonsRes = await pool.query(
      "SELECT * FROM lessons WHERE course_id = $1 ORDER BY id ASC",
      [id]
    );
    res.json({ ...courseRes.rows[0], lessons: lessonsRes.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query("SELECT * FROM courses WHERE id = $1", [id]);
    if (!check.rows.length) return res.status(404).json({ message: "Course not found" });

    // Admins can edit any course.
    // Instructors can only edit courses linked to them in instructor_courses.
    if (req.user.role === "instructor") {
      const ownership = await pool.query(
        "SELECT 1 FROM instructor_courses WHERE instructor_id = $1 AND course_id = $2",
        [req.user.id, id]
      );
      if (ownership.rowCount === 0) {
        return res.status(403).json({ message: "Access denied: you do not own this course" });
      }
    }

    const { title, description, price, thumbnail, category, level, published } = req.body;
    const updated = await pool.query(
      `UPDATE courses
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           thumbnail = COALESCE($4, thumbnail),
           category = COALESCE($5, category),
           level = COALESCE($6, level),
           published = COALESCE($7, published)
       WHERE id = $8
       RETURNING *`,
      [title, description, price, thumbnail, category, level, published, id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query("SELECT * FROM courses WHERE id = $1", [id]);
    if (!check.rows.length) return res.status(404).json({ message: "Course not found" });

    // Same ownership check as updateCourse — use instructor_courses table.
    if (req.user.role === "instructor") {
      const ownership = await pool.query(
        "SELECT 1 FROM instructor_courses WHERE instructor_id = $1 AND course_id = $2",
        [req.user.id, id]
      );
      if (ownership.rowCount === 0) {
        return res.status(403).json({ message: "Access denied: you do not own this course" });
      }
    }

    await pool.query("DELETE FROM courses WHERE id = $1", [id]);
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};