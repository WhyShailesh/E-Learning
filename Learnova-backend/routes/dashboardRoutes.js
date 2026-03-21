import express from "express";
import {
  adminDashboard,
  instructorDashboard,
  learnerDashboard,
} from "../controllers/dashboardController.js";
import { requireRole, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/learner", verifyToken, requireRole("learner"), learnerDashboard);
router.get("/instructor", verifyToken, requireRole("instructor"), instructorDashboard);
router.get("/admin", verifyToken, requireRole("admin"), adminDashboard);

export default router;
