import express from "express";
import { createLesson, deleteLesson, getLessons } from "../controllers/lessonController.js";
import { requireRole, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, requireRole("admin", "instructor"), createLesson);
router.get("/:courseId", getLessons);
router.delete("/:lessonId", verifyToken, requireRole("admin", "instructor"), deleteLesson);

export default router;