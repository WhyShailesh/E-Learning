import express from "express";
import {
  enrollCourse,
  getCourseParticipants,
  getMyEnrollments,
} from "../controllers/enrollmentController.js";
import { requireRole, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, requireRole("learner"), enrollCourse);
router.get("/me", verifyToken, getMyEnrollments);
router.get("/course/:courseId", verifyToken, requireRole("admin", "instructor"), getCourseParticipants);

export default router;
