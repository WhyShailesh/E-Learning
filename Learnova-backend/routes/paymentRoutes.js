import express from "express";
import { verifyRazorpayPayment } from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/verify", verifyToken, verifyRazorpayPayment);

export default router;
