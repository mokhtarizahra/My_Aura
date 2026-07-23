import express from "express";
import {createOrUpdateProfile , getMyProfile} from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// create or update profile
router.post("/", protect, createOrUpdateProfile);

// get logged user profile 
router.get("/me", protect, getMyProfile);

export default router;