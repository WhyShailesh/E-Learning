import pool from "../config/db.js";

const ok   = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, message, status = 400) => res.status(status).json({ success: false, message });

// Shared ownership check (same logic as courseController)
async function userOwnsCourse(userId, courseId) {
  const result = await pool.query(
    `SELECT 1 FROM courses WHERE id = $1 AND instructor_id = $2
     UNION
     SELECT 1 FROM instructor_courses WHERE course_id = $1 AND (user_id = $2 OR instructor_id = $2)
     LIMIT 1`,
    [courseId, userId]
  );
  return result.rowCount > 0;
}

// ── A3: GET /courses/:courseId/lessons ─────────────────────────────────────
export const getLessons = async (req, res) => {
  try {
    const courseId = req.params.courseId || req.params.id;
    const result = await pool.query(
      `SELECT l.*, l.type AS content_type,
              lc.video_url, lc.document_url, lc.image_url, lc.allow_download
       FROM lessons l
       LEFT JOIN lesson_content lc ON lc.lesson_id = l.id
       WHERE l.course_id = $1
       ORDER BY l.id ASC`,
      [courseId]
    );
    return ok(res, result.rows);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A3: POST /lessons ──────────────────────────────────────────────────────
export const createLesson = async (req, res) => {
  try {
    const course_id = req.params.courseId || req.params.id || req.body.course_id;
    const {
      title,
      type,
      content_type,
      content_url = null,
      description = null,
      duration = 0,
    } = req.body;
    
    const finalType = type || content_type || "video";

    if (!course_id || !title) return fail(res, "course_id and title are required");

    const courseRes = await pool.query("SELECT * FROM courses WHERE id = $1", [course_id]);
    if (!courseRes.rows.length) return fail(res, "Course not found", 404);

    if (req.user.role !== "admin") {
      const owns = await userOwnsCourse(req.user.id, course_id);
      if (!owns) return fail(res, "You can only add lessons to your own course", 403);
    }

    const result = await pool.query(
      `INSERT INTO lessons (course_id, title, type, content_url, description, duration, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *, type AS content_type`,
      [course_id, title, finalType, content_url, description, duration, req.user.id]
    );
    return ok(res, result.rows[0], 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

export const updateLesson = async (req, res) => {
  try {
    const lessonId = req.params.lessonId || req.params.id;
    const { title, type, content_type, content_url, description, duration } = req.body;
    
    const finalType = type || content_type;

    const lessonRes = await pool.query("SELECT * FROM lessons WHERE id = $1", [lessonId]);
    if (!lessonRes.rows.length) return fail(res, "Lesson not found", 404);

    if (req.user.role !== "admin") {
      const owns = await userOwnsCourse(req.user.id, lessonRes.rows[0].course_id);
      if (!owns) return fail(res, "You can only edit lessons from your own course", 403);
    }

    const result = await pool.query(
      `UPDATE lessons
       SET title       = COALESCE($1, title),
           type        = COALESCE($2, type),
           content_url = COALESCE($3, content_url),
           description = COALESCE($4, description),
           duration    = COALESCE($5, duration)
       WHERE id = $6
       RETURNING *, type AS content_type`,
      [title, finalType, content_url, description, duration, lessonId]
    );
    return ok(res, result.rows[0]);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A3: DELETE /lessons/:id ────────────────────────────────────────────────
export const deleteLesson = async (req, res) => {
  try {
    const lessonId = req.params.lessonId || req.params.id;
    const lessonRes = await pool.query("SELECT * FROM lessons WHERE id = $1", [lessonId]);
    if (!lessonRes.rows.length) return fail(res, "Lesson not found", 404);

    if (req.user.role !== "admin") {
      const owns = await userOwnsCourse(req.user.id, lessonRes.rows[0].course_id);
      if (!owns) return fail(res, "You can only delete lessons from your own course", 403);
    }

    await pool.query("DELETE FROM lessons WHERE id = $1", [lessonId]);
    return ok(res, { message: "Lesson deleted successfully" });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A4: GET /lessons/:id/full ──────────────────────────────────────────────
export const getLessonFull = async (req, res) => {
  try {
    const { id } = req.params;
    const lessonRes = await pool.query("SELECT * FROM lessons WHERE id = $1", [id]);
    if (!lessonRes.rows.length) return fail(res, "Lesson not found", 404);

    const [content, descriptions, attachments] = await Promise.all([
      pool.query("SELECT * FROM lesson_content WHERE lesson_id = $1", [id]),
      pool.query("SELECT * FROM lesson_descriptions WHERE lesson_id = $1 ORDER BY id ASC", [id]),
      pool.query("SELECT * FROM lesson_attachments WHERE lesson_id = $1 ORDER BY id ASC", [id]),
    ]);

    return ok(res, {
      ...lessonRes.rows[0],
      content: content.rows[0] || null,
      descriptions: descriptions.rows,
      attachments: attachments.rows,
    });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A4: PUT /lessons/:id/content ──────────────────────────────────────────
export const upsertLessonContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { video_url, document_url, image_url, allow_download = false } = req.body;

    const lessonRes = await pool.query("SELECT 1 FROM lessons WHERE id = $1", [id]);
    if (!lessonRes.rows.length) return fail(res, "Lesson not found", 404);

    const result = await pool.query(
      `INSERT INTO lesson_content (lesson_id, video_url, document_url, image_url, allow_download)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (lesson_id) DO UPDATE
         SET video_url      = EXCLUDED.video_url,
             document_url   = EXCLUDED.document_url,
             image_url      = EXCLUDED.image_url,
             allow_download = EXCLUDED.allow_download
       RETURNING *`,
      [id, video_url, document_url, image_url, allow_download]
    );
    return ok(res, result.rows[0]);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A4: POST /lessons/:id/descriptions ────────────────────────────────────
export const addLessonDescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    if (!description) return fail(res, "description is required");

    const lessonRes = await pool.query("SELECT 1 FROM lessons WHERE id = $1", [id]);
    if (!lessonRes.rows.length) return fail(res, "Lesson not found", 404);

    const result = await pool.query(
      "INSERT INTO lesson_descriptions (lesson_id, description) VALUES ($1, $2) RETURNING *",
      [id, description]
    );
    return ok(res, result.rows[0], 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A4: POST /lessons/:id/attachments ─────────────────────────────────────
export const addLessonAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = "file", file_url, external_link, label } = req.body;

    const lessonRes = await pool.query("SELECT 1 FROM lessons WHERE id = $1", [id]);
    if (!lessonRes.rows.length) return fail(res, "Lesson not found", 404);

    const result = await pool.query(
      `INSERT INTO lesson_attachments (lesson_id, type, file_url, external_link, label)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, type, file_url, external_link, label]
    );
    return ok(res, result.rows[0], 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A4: DELETE /lessons/:id/attachments/:attId ─────────────────────────────
export const deleteLessonAttachment = async (req, res) => {
  try {
    const { attId } = req.params;
    const r = await pool.query(
      "DELETE FROM lesson_attachments WHERE id = $1 RETURNING id",
      [attId]
    );
    if (!r.rowCount) return fail(res, "Attachment not found", 404);
    return ok(res, { message: "Attachment deleted" });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};