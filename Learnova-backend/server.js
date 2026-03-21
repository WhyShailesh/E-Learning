import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";

import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import instructorSelfRoutes from "./routes/instructorSelfRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import pool from "./config/db.js";
import { setupDatabase } from "./scripts/dbSetup.js";
import { seedAdmin } from "./scripts/seedAdmin.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

import path from 'path';

// ── Security & Parsing ─────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:8080",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(helmet({ crossOriginResourcePolicy: false })); // allow images to load
app.use(express.json());
app.use(morgan("dev"));

// Serve local uploads
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// ── Rate Limiting ──────────────────────────────────────────────────────────
app.use("/api/", apiLimiter);
app.use("/api/auth/", authLimiter);

// ── Request Logger ─────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

// ── Health Check ───────────────────────────────────────────────────────────
app.get("/api/test", (_req, res) => {
  res.json({ success: true, message: "Learnova API is running" });
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/dashboards", dashboardRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/instructor", instructorSelfRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/upload", uploadRoutes);

// ── Centralized Error Handler ──────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[SERVER] Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ── 404 Handler ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Start Server ───────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🚀 Learnova Server running on port ${PORT}`);

  try {
    await pool.query("SELECT 1");
    console.log("✅ PostgreSQL connected");
    await setupDatabase();
    console.log("✅ Database schema verified and up-to-date");
    await seedAdmin();
    console.log("✅ Admin seed checked");
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);
  }
});