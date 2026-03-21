import pool from "../config/db.js";

// ── Helpers ────────────────────────────────────────────────────────────────
const ok   = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, message, status = 400) => res.status(status).json({ success: false, message });

// ── Ownership helper: check if a user owns/is-assigned to a course ─────────
// Supports both users-table instructors (via courses.instructor_id or instructor_courses.user_id)
// and the legacy instructors-table entries (via instructor_courses.instructor_id)
async function userOwnsCourse(userId, courseId) {
  const result = await pool.query(
    `SELECT 1 FROM courses WHERE id = $1 AND instructor_id = $2
     UNION
     SELECT 1 FROM instructor_courses WHERE course_id = $1 AND user_id = $2
     LIMIT 1`,
    [courseId, userId]
  );
  return result.rowCount > 0;
}

// ── A1: GET /courses ───────────────────────────────────────────────────────
// ?search=  ?view=kanban|list  ?includeAll=true (admin/instructor only)
// Access rules:
//   - No auth / learner  → only published courses
//   - Instructor         → own courses (any status) + others' published
//   - Admin              → everything (when includeAll=true, else also all)
export const getCourses = async (req, res) => {
  try {
    const { search = "", includeAll } = req.query;
    const role = req.user?.role ?? "guest";
    const userId = req.user?.id ?? null;
    const showAll = (role === "admin") || (includeAll === "true" && role === "admin");
    const isInstructor = role === "instructor";

    console.log(`[API] GET /courses — role=${role} userId=${userId} search="${search}" includeAll=${includeAll}`);

    let result;

    if (role === "admin") {
      // Admin sees everything
      result = await pool.query(
        `SELECT
            c.id, c.title, c.description, c.tags, c.views_count, c.is_published, c.published,
            c.category, c.level, c.price, c.thumbnail, c.course_image, c.visibility,
            c.access_rule, c.website_id, c.responsible_id, c.instructor_id,
            c.created_by, c.created_at,
            u.name                               AS instructor_name,
            COUNT(DISTINCT l.id)::int            AS total_lessons,
            COALESCE(SUM(l.duration), 0)::int    AS total_duration
         FROM courses c
         LEFT JOIN users u ON u.id = c.instructor_id
         LEFT JOIN lessons l ON l.course_id = c.id
         WHERE ($1 = '' OR c.title ILIKE $2)
         GROUP BY c.id, u.name
         ORDER BY c.id DESC`,
        [search, `%${search}%`]
      );
    } else if (isInstructor && userId) {
      // Instructor sees all their own courses + all published from others
      result = await pool.query(
        `SELECT
            c.id, c.title, c.description, c.tags, c.views_count, c.is_published, c.published,
            c.category, c.level, c.price, c.thumbnail, c.course_image, c.visibility,
            c.access_rule, c.website_id, c.responsible_id, c.instructor_id,
            c.created_by, c.created_at,
            u.name                               AS instructor_name,
            COUNT(DISTINCT l.id)::int            AS total_lessons,
            COALESCE(SUM(l.duration), 0)::int    AS total_duration
         FROM courses c
         LEFT JOIN users u ON u.id = c.instructor_id
         LEFT JOIN lessons l ON l.course_id = c.id
         WHERE (
           c.instructor_id = $1
           OR EXISTS (
             SELECT 1 FROM instructor_courses ic
             WHERE ic.course_id = c.id AND (ic.user_id = $1)
           )
           OR (c.is_published = true OR c.published = true)
         )
         AND ($2 = '' OR c.title ILIKE $3)
         GROUP BY c.id, u.name
         ORDER BY c.id DESC`,
        [userId, search, `%${search}%`]
      );
    } else {
      // Guest / learner — only published
      result = await pool.query(
        `SELECT
            c.id, c.title, c.description, c.tags, c.views_count, c.is_published, c.published,
            c.category, c.level, c.price, c.thumbnail, c.course_image, c.visibility,
            c.access_rule, c.website_id, c.responsible_id, c.instructor_id,
            c.created_by, c.created_at,
            u.name                               AS instructor_name,
            COUNT(DISTINCT l.id)::int            AS total_lessons,
            COALESCE(SUM(l.duration), 0)::int    AS total_duration
         FROM courses c
         LEFT JOIN users u ON u.id = c.instructor_id
         LEFT JOIN lessons l ON l.course_id = c.id
         WHERE (c.is_published = true OR c.published = true)
           AND ($1 = '' OR c.title ILIKE $2)
         GROUP BY c.id, u.name
         ORDER BY c.id DESC`,
        [search, `%${search}%`]
      );
    }

    console.log(`[API] GET /courses — ${result.rows.length} rows returned`);
    return ok(res, result.rows);
  } catch (err) {
    console.error("[API] GET /courses error:", err.message);
    return fail(res, err.message, 500);
  }
};

// ── A1 / A2: GET /courses/:id ─────────────────────────────────────────────
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

    if (!courseRes.rows.length) return fail(res, "Course not found", 404);

    // Increment views_count
    await pool.query(
      "UPDATE courses SET views_count = COALESCE(views_count, 0) + 1 WHERE id = $1",
      [id]
    );

    const lessonsRes = await pool.query(
      `SELECT l.*,
              lc.video_url, lc.document_url, lc.image_url, lc.allow_download
       FROM lessons l
       LEFT JOIN lesson_content lc ON lc.lesson_id = l.id
       WHERE l.course_id = $1
       ORDER BY l.id ASC`,
      [id]
    );

    return ok(res, { ...courseRes.rows[0], lessons: lessonsRes.rows });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A1 / A2: POST /courses ────────────────────────────────────────────────
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description = "",
      price = 0,
      thumbnail = null,
      category = null,
      level = null,
      published = false,
      tags = null,
      visibility = "everyone",
      access_rule = "open",
      course_image = null,
      website_id = null,
      responsible_id = null,
    } = req.body;

    if (!title) return fail(res, "title is required");

    const result = await pool.query(
      `INSERT INTO courses
         (title, description, instructor_id, price, thumbnail, category, level,
          published, is_published, tags, views_count, visibility, access_rule,
          course_image, website_id, responsible_id, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8,$9,0,$10,$11,$12,$13,$14,$3)
       RETURNING *`,
      [
        title, description, req.user.id, price, thumbnail, category, level,
        published, tags, visibility, access_rule, course_image, website_id, responsible_id,
      ]
    );

    const course = result.rows[0];

    // Link to instructor_courses join table using user_id column
    if (req.user.role === "instructor") {
      await pool.query(
        `INSERT INTO instructor_courses (user_id, course_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [req.user.id, course.id]
      );
    }

    return ok(res, course, 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A2: PUT /courses/:id ──────────────────────────────────────────────────
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const check = await pool.query("SELECT * FROM courses WHERE id = $1", [id]);
    if (!check.rows.length) return fail(res, "Course not found", 404);

    if (req.user.role === "instructor") {
      const owns = await userOwnsCourse(req.user.id, id);
      if (!owns) return fail(res, "Access denied: you do not own this course", 403);
    }

    const {
      title, description, price, thumbnail, category, level, published,
      tags, visibility, access_rule, course_image, website_id, responsible_id,
    } = req.body;

    const updated = await pool.query(
      `UPDATE courses
       SET title          = COALESCE($1,  title),
           description    = COALESCE($2,  description),
           price          = COALESCE($3,  price),
           thumbnail      = COALESCE($4,  thumbnail),
           category       = COALESCE($5,  category),
           level          = COALESCE($6,  level),
           published      = COALESCE($7,  published),
           is_published   = COALESCE($7,  is_published),
           tags           = COALESCE($8,  tags),
           visibility     = COALESCE($9,  visibility),
           access_rule    = COALESCE($10, access_rule),
           course_image   = COALESCE($11, course_image),
           website_id     = COALESCE($12, website_id),
           responsible_id = COALESCE($13, responsible_id)
       WHERE id = $14
       RETURNING *`,
      [
        title, description, price, thumbnail, category, level, published,
        tags, visibility, access_rule, course_image, website_id, responsible_id, id,
      ]
    );

    return ok(res, updated.rows[0]);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A5: PATCH /courses/:id/publish ────────────────────────────────────────
export const publishCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const check = await pool.query("SELECT * FROM courses WHERE id = $1", [id]);
    if (!check.rows.length) return fail(res, "Course not found", 404);

    if (req.user.role === "instructor") {
      const owns = await userOwnsCourse(req.user.id, id);
      if (!owns) return fail(res, "Access denied", 403);
    }

    const current = check.rows[0].published || check.rows[0].is_published;
    const result = await pool.query(
      `UPDATE courses
       SET published = $1, is_published = $1
       WHERE id = $2
       RETURNING *`,
      [!current, id]
    );

    return ok(res, result.rows[0]);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A1: POST /courses/:id/share ───────────────────────────────────────────
export const shareCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query("SELECT id, title FROM courses WHERE id = $1", [id]);
    if (!check.rows.length) return fail(res, "Course not found", 404);

    const base = process.env.FRONTEND_URL || "http://localhost:8080";
    const shareableLink = `${base}/learner/courses/${id}`;

    return ok(res, {
      course_id: parseInt(id),
      title: check.rows[0].title,
      sharable_link: shareableLink,
    });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── DELETE /courses/:id ───────────────────────────────────────────────────
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query("SELECT * FROM courses WHERE id = $1", [id]);
    if (!check.rows.length) return fail(res, "Course not found", 404);

    if (req.user.role === "instructor") {
      const owns = await userOwnsCourse(req.user.id, id);
      if (!owns) return fail(res, "Access denied", 403);
    }

    await pool.query("DELETE FROM courses WHERE id = $1", [id]);
    return ok(res, { message: "Course deleted successfully" });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A2: GET /courses/:id/attendees ────────────────────────────────────────
export const getAttendees = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT ca.id, ca.enrolled_at, u.id AS user_id, u.name, u.email
       FROM course_attendees ca
       JOIN users u ON u.id = ca.user_id
       WHERE ca.course_id = $1
       ORDER BY ca.enrolled_at DESC`,
      [id]
    );
    return ok(res, result.rows);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A2: POST /courses/:id/attendees ───────────────────────────────────────
export const addAttendee = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    if (!user_id) return fail(res, "user_id is required");

    const result = await pool.query(
      `INSERT INTO course_attendees (course_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (course_id, user_id) DO NOTHING
       RETURNING *`,
      [id, user_id]
    );
    return ok(res, result.rows[0] || { message: "Already enrolled" }, 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};