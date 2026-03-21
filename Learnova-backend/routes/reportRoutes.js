import express from "express";
import { getOverview, getUserProgress, upsertProgress } from "../controllers/reportController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// A8 — Reporting
router.get("/overview", verifyToken, requireRole("admin", "instructor"), getOverview);
router.get("/users", verifyToken, requireRole("admin", "instructor"), getUserProgress);
router.patch("/progress", verifyToken, upsertProgress);

export default router;
