import express from "express";
import {
  createQuiz,
  addQuestion,
  getCourseQuizzes,
  getQuiz,
  submitQuiz
} from "../controllers/quizController.js";

import { requireRole, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, requireRole("admin", "instructor"), createQuiz);
router.post("/question", verifyToken, requireRole("admin", "instructor"), addQuestion);
router.get("/course/:courseId", getCourseQuizzes);
router.get("/:quizId", getQuiz);
router.post("/submit", verifyToken, submitQuiz);

export default router;