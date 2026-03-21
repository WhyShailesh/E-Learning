import pool from "../config/db.js";

// CREATE QUIZ
export const createQuiz = async (req, res) => {
  try {
    const { course_id, title } = req.body;
    if (!course_id || !title) return res.status(400).json({ message: "course_id and title are required" });

    const courseRes = await pool.query("SELECT * FROM courses WHERE id = $1", [course_id]);
    if (!courseRes.rows.length) return res.status(404).json({ message: "Course not found" });
    const course = courseRes.rows[0];
    if (req.user.role !== "admin" && course.instructor_id !== req.user.id) {
      return res.status(403).json({ message: "You can only create quiz for your own course" });
    }

    const result = await pool.query(
      "INSERT INTO quizzes (course_id, title) VALUES ($1, $2) RETURNING *",
      [course_id, title]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD QUESTION
export const addQuestion = async (req, res) => {
  try {
    const { quiz_id, question, options } = req.body;
    if (!quiz_id || !question || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({ message: "quiz_id, question and options are required" });
    }

    const questionRes = await pool.query(
      "INSERT INTO questions (quiz_id, question) VALUES ($1, $2) RETURNING *",
      [quiz_id, question]
    );

    const questionId = questionRes.rows[0].id;

    for (let opt of options) {
      await pool.query(
        "INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, $2, $3)",
        [questionId, opt.text, opt.is_correct]
      );
    }

    res.status(201).json({ message: "Question added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET QUIZ WITH QUESTIONS
export const getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await pool.query(
      "SELECT * FROM quizzes WHERE id = $1",
      [quizId]
    );

    const questions = await pool.query(
      "SELECT * FROM questions WHERE quiz_id = $1",
      [quizId]
    );

    for (let q of questions.rows) {
      const opts = await pool.query(
        "SELECT * FROM options WHERE question_id = $1",
        [q.id]
      );
      q.options = opts.rows;
    }

    res.json({
      quiz: quiz.rows[0],
      questions: questions.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// SUBMIT QUIZ
export const submitQuiz = async (req, res) => {
  try {
    const { quiz_id, answers } = req.body;
    const user_id = req.user.id;

    let score = 0;

    for (let ans of answers) {
      const correct = await pool.query(
        "SELECT * FROM options WHERE id = $1 AND is_correct = true",
        [ans.option_id]
      );

      if (correct.rows.length > 0) {
        score++;
      }
    }

    // count attempts
    const attemptCount = await pool.query(
      "SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2",
      [user_id, quiz_id]
    );

    const attempt_number = parseInt(attemptCount.rows[0].count) + 1;

    await pool.query(
      "INSERT INTO quiz_attempts (user_id, quiz_id, score, attempt_number) VALUES ($1, $2, $3, $4)",
      [user_id, quiz_id, score, attempt_number]
    );

    res.json({
      score,
      attempt_number
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await pool.query("SELECT * FROM quizzes WHERE course_id = $1 ORDER BY id ASC", [courseId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};