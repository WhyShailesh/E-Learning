import express from "express";
import { getMyCourses } from "../controllers/instructorController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/instructor/my-courses — instructor views their own assigned courses
router.get("/my-courses", verifyToken, requireRole("instructor"), getMyCourses);

export default router;
