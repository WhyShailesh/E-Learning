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
import pool from "./config/db.js";
import { setupDatabase } from "./scripts/dbSetup.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/api/test", (_req, res) => {
  res.json({ message: "API working" });
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/dashboards", dashboardRoutes);
app.use("/api/payments", paymentRoutes);

app.use((err, _req, res, _next) => {
  console.error("[SERVER] Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    await pool.query("SELECT 1");
    console.log("PostgreSQL connected");
    await setupDatabase();
    console.log("Database setup verified");
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
  }
});