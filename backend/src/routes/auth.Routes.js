import express from "express";
import {
  requestOTP,
  verifyOTP,
  loginWithPassword,
  setPassword,
  refreshAccessToken,
  logout,
  getSessions,
  revokeSession
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.Middleware.js";
import { otpLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/request-otp", otpLimiter, requestOTP);

router.post("/verify-otp", otpLimiter, verifyOTP);

router.post("/login", loginWithPassword);

router.post("/set-password", protect, setPassword);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", logout);

router.get("/sessions", protect, getSessions);

router.delete("/sessions/:id", protect, revokeSession);

export default router;
