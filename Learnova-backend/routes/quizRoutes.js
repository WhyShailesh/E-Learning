
import express from "express";
import {
  getQuizzesForCourse,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuiz,
  addQuizQuestion,
  addQuizOption,
  setQuizRewards,
  addQuestion,       // legacy
  submitQuiz,        // legacy
  getCourseQuizzes,  // legacy
} from "../controllers/quizController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// A6 — Quiz CRUD
router.get("/course/:courseId", getCourseQuizzes);          // legacy compat
router.get("/:id", getQuiz);
router.post("/", verifyToken, requireRole("admin", "instructor"), createQuiz);
router.put("/:id", verifyToken, requireRole("admin", "instructor"), updateQuiz);
router.delete("/:id", verifyToken, requireRole("admin", "instructor"), deleteQuiz);

// A7 — Quiz Builder
router.post("/questions", verifyToken, requireRole("admin", "instructor"), addQuizQuestion);
router.post("/options", verifyToken, requireRole("admin", "instructor"), addQuizOption);
router.post("/rewards", verifyToken, requireRole("admin", "instructor"), setQuizRewards);

// Legacy
router.post("/question", verifyToken, requireRole("admin", "instructor"), addQuestion);
router.post("/submit", verifyToken, submitQuiz);

export default router;
