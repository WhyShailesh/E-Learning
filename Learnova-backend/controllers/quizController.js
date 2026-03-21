
import pool from "../config/db.js";

const ok   = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, message, status = 400) => res.status(status).json({ success: false, message });

// Shared ownership check
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

// ── A6: GET /courses/:id/quizzes ───────────────────────────────────────────
export const getQuizzesForCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId || req.params.id;
    const result = await pool.query(
      `SELECT q.*,
              COUNT(DISTINCT qq.id)::int AS total_questions
       FROM quizzes q
       LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
       WHERE q.course_id = $1
       GROUP BY q.id
       ORDER BY q.id ASC`,
      [courseId]
    );
    return ok(res, result.rows);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A6: POST /quizzes ──────────────────────────────────────────────────────
export const createQuiz = async (req, res) => {
  try {
    const { course_id, title } = req.body;
    if (!course_id || !title) return fail(res, "course_id and title are required");

    const courseRes = await pool.query("SELECT * FROM courses WHERE id = $1", [course_id]);
    if (!courseRes.rows.length) return fail(res, "Course not found", 404);

    if (req.user.role !== "admin") {
      const owns = await userOwnsCourse(req.user.id, course_id);
      if (!owns) return fail(res, "Access denied", 403);
    }

    const result = await pool.query(
      "INSERT INTO quizzes (course_id, title) VALUES ($1, $2) RETURNING *",
      [course_id, title]
    );
    return ok(res, result.rows[0], 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A6: PUT /quizzes/:id ───────────────────────────────────────────────────
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const qRes = await pool.query("SELECT * FROM quizzes WHERE id = $1", [id]);
    if (!qRes.rows.length) return fail(res, "Quiz not found", 404);

    if (req.user.role !== "admin") {
      const owns = await userOwnsCourse(req.user.id, qRes.rows[0].course_id);
      if (!owns) return fail(res, "Access denied", 403);
    }

    const result = await pool.query(
      "UPDATE quizzes SET title = COALESCE($1, title) WHERE id = $2 RETURNING *",
      [title, id]
    );
    return ok(res, result.rows[0]);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A6: DELETE /quizzes/:id ────────────────────────────────────────────────
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const qRes = await pool.query("SELECT * FROM quizzes WHERE id = $1", [id]);
    if (!qRes.rows.length) return fail(res, "Quiz not found", 404);

    if (req.user.role !== "admin") {
      const owns = await userOwnsCourse(req.user.id, qRes.rows[0].course_id);
      if (!owns) return fail(res, "Access denied", 403);
    }

    await pool.query("DELETE FROM quizzes WHERE id = $1", [id]);
    return ok(res, { message: "Quiz deleted successfully" });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A6: GET /quizzes/:id (full quiz with questions + options + rewards) ─────
export const getQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await pool.query("SELECT * FROM quizzes WHERE id = $1", [id]);
    if (!quiz.rows.length) return fail(res, "Quiz not found", 404);

    const questions = await pool.query(
      `SELECT qq.*, json_agg(
          json_build_object('id', qo.id, 'option_text', qo.option_text, 'is_correct', qo.is_correct)
          ORDER BY qo.id
       ) FILTER (WHERE qo.id IS NOT NULL) AS options
       FROM quiz_questions qq
       LEFT JOIN quiz_options qo ON qo.question_id = qq.id
       WHERE qq.quiz_id = $1
       GROUP BY qq.id
       ORDER BY qq.order_index ASC, qq.id ASC`,
      [id]
    );

    const rewards = await pool.query(
      "SELECT * FROM quiz_rewards WHERE quiz_id = $1",
      [id]
    );

    return ok(res, {
      ...quiz.rows[0],
      questions: questions.rows,
      rewards: rewards.rows[0] || null,
    });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A7: POST /quiz/questions ───────────────────────────────────────────────
export const addQuizQuestion = async (req, res) => {
  try {
    const { quiz_id, question_text, order_index = 0 } = req.body;
    if (!quiz_id || !question_text) return fail(res, "quiz_id and question_text are required");

    const qRes = await pool.query("SELECT 1 FROM quizzes WHERE id = $1", [quiz_id]);
    if (!qRes.rows.length) return fail(res, "Quiz not found", 404);

    const result = await pool.query(
      "INSERT INTO quiz_questions (quiz_id, question_text, order_index) VALUES ($1, $2, $3) RETURNING *",
      [quiz_id, question_text, order_index]
    );
    return ok(res, result.rows[0], 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A7: POST /quiz/options ────────────────────────────────────────────────
export const addQuizOption = async (req, res) => {
  try {
    const { question_id, option_text, is_correct = false } = req.body;
    if (!question_id || !option_text) return fail(res, "question_id and option_text are required");

    const qRes = await pool.query("SELECT 1 FROM quiz_questions WHERE id = $1", [question_id]);
    if (!qRes.rows.length) return fail(res, "Question not found", 404);

    const result = await pool.query(
      "INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES ($1, $2, $3) RETURNING *",
      [question_id, option_text, is_correct]
    );
    return ok(res, result.rows[0], 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── A7: POST /quiz/rewards ────────────────────────────────────────────────
export const setQuizRewards = async (req, res) => {
  try {
    const {
      quiz_id,
      first_try_points = 0,
      second_try_points = 0,
      third_try_points = 0,
      fourth_try_points = 0,
    } = req.body;
    if (!quiz_id) return fail(res, "quiz_id is required");

    const qRes = await pool.query("SELECT 1 FROM quizzes WHERE id = $1", [quiz_id]);
    if (!qRes.rows.length) return fail(res, "Quiz not found", 404);

    const result = await pool.query(
      `INSERT INTO quiz_rewards (quiz_id, first_try_points, second_try_points, third_try_points, fourth_try_points)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (quiz_id) DO UPDATE
         SET first_try_points  = EXCLUDED.first_try_points,
             second_try_points = EXCLUDED.second_try_points,
             third_try_points  = EXCLUDED.third_try_points,
             fourth_try_points = EXCLUDED.fourth_try_points
       RETURNING *`,
      [quiz_id, first_try_points, second_try_points, third_try_points, fourth_try_points]
    );
    return ok(res, result.rows[0]);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── Legacy: addQuestion ───────────────────────────────────────────────────
export const addQuestion = async (req, res) => {
  try {
    const { quiz_id, question, options } = req.body;
    if (!quiz_id || !question || !Array.isArray(options) || options.length === 0) {
      return fail(res, "quiz_id, question and options[] are required");
    }

    const qRes = await pool.query(
      "INSERT INTO questions (quiz_id, question) VALUES ($1, $2) RETURNING *",
      [quiz_id, question]
    );
    const questionId = qRes.rows[0].id;

    for (const opt of options) {
      await pool.query(
        "INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, $2, $3)",
        [questionId, opt.text, opt.is_correct ?? false]
      );
    }
    return ok(res, { message: "Question added", question_id: questionId }, 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── Legacy: submitQuiz ────────────────────────────────────────────────────
export const submitQuiz = async (req, res) => {
  try {
    const { quiz_id, answers } = req.body;
    const user_id = req.user.id;
    let score = 0;

    for (const ans of answers) {
      const correct = await pool.query(
        "SELECT 1 FROM options WHERE id = $1 AND is_correct = true",
        [ans.option_id]
      );
      if (correct.rows.length > 0) score++;
    }

    const countRes = await pool.query(
      "SELECT COUNT(*) FROM quiz_attempts WHERE user_id=$1 AND quiz_id=$2",
      [user_id, quiz_id]
    );
    const attempt_number = parseInt(countRes.rows[0].count) + 1;

    await pool.query(
      "INSERT INTO quiz_attempts (user_id, quiz_id, score, attempt_number) VALUES ($1,$2,$3,$4)",
      [user_id, quiz_id, score, attempt_number]
    );

    return ok(res, { score, attempt_number });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ── Legacy: getCourseQuizzes ──────────────────────────────────────────────
export const getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await pool.query(
      "SELECT * FROM quizzes WHERE course_id = $1 ORDER BY id ASC",
      [courseId]
    );
    return ok(res, result.rows);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};
