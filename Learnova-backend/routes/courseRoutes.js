import express from "express";
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  updateCourse,
} from "../controllers/courseController.js";
import { requireRole, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, requireRole("admin", "instructor"), createCourse);
router.get("/", getCourses);
router.get("/:id", getCourseById);
router.put("/:id", verifyToken, requireRole("admin", "instructor"), updateCourse);
router.delete("/:id", verifyToken, requireRole("admin", "instructor"), deleteCourse);

export default router;