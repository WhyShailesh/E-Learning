import express from "express";
import {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonFull,
  upsertLessonContent,
  addLessonDescription,
  addLessonAttachment,
  deleteLessonAttachment,
} from "../controllers/lessonController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// List lessons for a course (legacy route kept working)
router.get("/:courseId", getLessons);

// Full lesson detail (with content + descriptions + attachments)
router.get("/:id/full", getLessonFull);

// CRUD
router.post("/", verifyToken, requireRole("admin", "instructor"), createLesson);
router.put("/:id", verifyToken, requireRole("admin", "instructor"), updateLesson);
router.delete("/:id", verifyToken, requireRole("admin", "instructor"), deleteLesson);

// A4 — Lesson Editor sub-routes
router.put("/:id/content", verifyToken, requireRole("admin", "instructor"), upsertLessonContent);
router.post("/:id/descriptions", verifyToken, requireRole("admin", "instructor"), addLessonDescription);
router.post("/:id/attachments", verifyToken, requireRole("admin", "instructor"), addLessonAttachment);
router.delete("/:id/attachments/:attId", verifyToken, requireRole("admin", "instructor"), deleteLessonAttachment);

export default router;