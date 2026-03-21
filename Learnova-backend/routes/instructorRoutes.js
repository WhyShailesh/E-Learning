import express from "express";
import { getInstructors, createInstructor, deleteInstructor } from "../controllers/instructorController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication + admin role
router.use(verifyToken, requireRole("admin"));

router.get("/", getInstructors);
router.post("/", createInstructor);
router.delete("/:id", deleteInstructor);

export default router;
