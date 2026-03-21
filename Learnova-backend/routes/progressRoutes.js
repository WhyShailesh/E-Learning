import express from "express";
import { getCourseProgress, upsertLessonProgress } from "../controllers/progressController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, upsertLessonProgress);
router.get("/:courseId", verifyToken, getCourseProgress);

export default router;
