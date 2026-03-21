import express from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  shareCourse,
  getAttendees,
  addAttendee,
} from "../controllers/courseController.js";
import { getLessons, createLesson } from "../controllers/lessonController.js";
import { getQuizzesForCourse } from "../controllers/quizController.js";
import { verifyToken, requireRole, authorizeRole, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public (optional auth for role-based filtering) ──────────────────────
router.get("/", optionalAuth, getCourses);
router.get("/:id", optionalAuth, getCourseById);

// ── Protected — admin or instructor ────────────────────────────────────────
router.post("/",
  verifyToken, authorizeRole("admin", "instructor"), createCourse);
router.put("/:id",
  verifyToken, authorizeRole("admin", "instructor"), updateCourse);
router.delete("/:id",
  verifyToken, authorizeRole("admin", "instructor"), deleteCourse);
router.patch("/:id/publish",
  verifyToken, authorizeRole("admin", "instructor"), publishCourse);
router.post("/:id/share",
  verifyToken, shareCourse);

// ── A2 — Attendees ─────────────────────────────────────────────────────────
router.get("/:id/attendees",
  verifyToken, authorizeRole("admin", "instructor"), getAttendees);
router.post("/:id/attendees",
  verifyToken, authorizeRole("admin", "instructor"), addAttendee);

// ── Sub-resources nested under course ──────────────────────────────────────
router.get("/:id/lessons", getLessons);
router.post("/:id/lessons", verifyToken, authorizeRole("admin", "instructor"), createLesson);
router.get("/:id/quizzes", getQuizzesForCourse);

export default router;