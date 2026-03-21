import express from "express";
import {
  getInstructors,
  getInstructorUsers,
  createInstructor,
  deleteInstructor,
  getParticipants,
} from "../controllers/instructorController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication + admin role
router.use(verifyToken, requireRole("admin"));

router.get("/participants", getParticipants);  // all learner participants
router.get("/", getInstructors);
router.get("/users", getInstructorUsers);   // instructors from the users table
router.post("/", createInstructor);
router.delete("/:id", deleteInstructor);

export default router;
