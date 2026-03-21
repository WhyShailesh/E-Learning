import pool from "../config/db.js";

const ok   = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, message, status = 400) => res.status(status).json({ success: false, message });

// ── A8: GET /reports/overview ──────────────────────────────────────────────
// Returns counts per status. Admin sees all; instructor sees their own courses.
export const getOverview = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";

    let courseIds = [];
    if (isAdmin) {
      const all = await pool.query("SELECT id FROM courses");
      courseIds = all.rows.map((r) => r.id);
    } else {
      // Instructor — includes direct ownership AND join-table ownership
      const mine = await pool.query(
        `SELECT DISTINCT c.id FROM courses c
         WHERE c.instructor_id = $1
         UNION
         SELECT ic.course_id FROM instructor_courses ic
         WHERE ic.user_id = $1`,
        [req.user.id]
      );
      courseIds = mine.rows.map((r) => r.id);
    }

    if (!courseIds.length) {
      return ok(res, {
        total_participants: 0,
        yet_to_start: 0,
        in_progress: 0,
        completed: 0,
        courses: [],
      });
    }

    const statsRes = await pool.query(
      `SELECT
         COUNT(*)::int                                                    AS total_participants,
         COUNT(*) FILTER (WHERE status = 'not_started')::int             AS yet_to_start,
         COUNT(*) FILTER (WHERE status = 'in_progress')::int             AS in_progress,
         COUNT(*) FILTER (WHERE status = 'completed')::int               AS completed
       FROM course_progress
       WHERE course_id = ANY($1::int[])`,
      [courseIds]
    );

    // Per-course breakdown
    const perCourse = await pool.query(
      `SELECT
         cp.course_id,
         c.title,
         COUNT(*)::int                                        AS total,
         COUNT(*) FILTER (WHERE cp.status='not_started')::int AS yet_to_start,
         COUNT(*) FILTER (WHERE cp.status='in_progress')::int  AS in_progress,
         COUNT(*) FILTER (WHERE cp.status='completed')::int    AS completed,
         ROUND(AVG(cp.completion_percentage)::numeric, 2)      AS avg_completion
       FROM course_progress cp
       JOIN courses c ON c.id = cp.course_id
       WHERE cp.course_id = ANY($1::int[])
       GROUP BY cp.course_id, c.title
       ORDER BY c.title ASC`,
      [courseIds]
    );

    return ok(res, {
      ...statsRes.rows[0],
      courses: perCourse.rows,
    });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A8: GET /reports/users ─────────────────────────────────────────────────
// ?course_id=  ?status=not_started|in_progress|completed  ?page=1 &limit=20
export const getUserProgress = async (req, res) => {
  try {
    const { course_id, status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const isAdmin = req.user.role === "admin";

    const conditions = [];
    const params = [];
    let idx = 1;

    if (!isAdmin) {
      // Restrict to instructor's own courses (via both direct and join-table ownership)
      params.push(req.user.id);
      conditions.push(
        `(c.instructor_id = $${idx} OR EXISTS (
           SELECT 1 FROM instructor_courses ic
           WHERE ic.course_id = c.id AND ic.user_id = $${idx}
         ))`
      );
      idx++;
    }

    if (course_id) {
      params.push(parseInt(course_id));
      conditions.push(`cp.course_id = $${idx++}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`cp.status = $${idx++}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const dataRes = await pool.query(
      `SELECT
         u.id        AS user_id,
         u.name      AS user_name,
         u.email,
         c.id        AS course_id,
         c.title     AS course_title,
         cp.status,
         cp.completion_percentage,
         cp.enrolled_date,
         cp.start_date,
         cp.completed_date,
         cp.time_spent
       FROM course_progress cp
       JOIN users u ON u.id = cp.user_id
       JOIN courses c ON c.id = cp.course_id
       ${whereClause}
       ORDER BY cp.enrolled_date DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, parseInt(limit), offset]
    );

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM course_progress cp
       JOIN courses c ON c.id = cp.course_id
       ${whereClause}`,
      params
    );

    return ok(res, {
      rows: dataRes.rows,
      total: countRes.rows[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A8: PATCH /reports/progress ────────────────────────────────────────────
// Upsert a user's course_progress record
export const upsertProgress = async (req, res) => {
  try {
    const { course_id, user_id, status, completion_percentage, time_spent } = req.body;
    if (!course_id || !user_id) return fail(res, "course_id and user_id are required");

    const result = await pool.query(
      `INSERT INTO course_progress (course_id, user_id, status, completion_percentage, time_spent)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (course_id, user_id) DO UPDATE
         SET status                = COALESCE(EXCLUDED.status, course_progress.status),
             completion_percentage = COALESCE(EXCLUDED.completion_percentage, course_progress.completion_percentage),
             time_spent            = COALESCE(EXCLUDED.time_spent, course_progress.time_spent),
             start_date            = CASE
               WHEN course_progress.start_date IS NULL AND EXCLUDED.status != 'not_started'
               THEN NOW() ELSE course_progress.start_date END,
             completed_date        = CASE
               WHEN EXCLUDED.status = 'completed' AND course_progress.completed_date IS NULL
               THEN NOW() ELSE course_progress.completed_date END
       RETURNING *`,
      [course_id, user_id, status || "not_started", completion_percentage || 0, time_spent || 0]
    );
    return ok(res, result.rows[0]);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};
