import express from "express";
import {
  requestOTP,
  verifyOTP,
  loginWithPassword,
  setPassword,
  refreshAccessToken,
  logout,
  getSessions,
  revokeSession,
  resendOTP
} from "../controllers/authController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";
import { otpLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Public paths
router.post("/request-otp", otpLimiter, requestOTP);
router.post("/verify-otp", otpLimiter, verifyOTP);
router.post("/login", loginWithPassword);
router.post("/refresh-token", refreshAccessToken);
router.post("/resend-otp", otpLimiter, resendOTP); 

// Protected routes (require login)
router.post("/set-password", protect, setPassword);
router.post("/logout", protect, logout);
router.get("/sessions", protect, getSessions);
router.delete("/sessions/:id", protect, revokeSession);

// Route for admins only
router.get("/admin-only", protect, authorize("super_admin"), (req, res) => {
  res.json({ message: "Welcome Admin!" });
});

// Path for the stadium manager and admin
router.get("/complex-or-admin", protect, authorize("super_admin", "sportsComplex_admin"), (req, res) => {
  res.json({ message: "Welcome Complex Admin or Super Admin!" });
});

export default router;
