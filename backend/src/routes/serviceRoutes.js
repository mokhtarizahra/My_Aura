import express from "express";

import {
  createService,
  getAllServices,
  getSingleService,
  updateService,
  deleteService,
  getMyServices
} from "../controllers/serviceController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// CREATE SERVICE
router.post("/", protect, createService);


// GET ALL SERVICES
router.get("/", getAllServices);


// GET MY SERVICES
router.get("/my/services", protect, getMyServices);


// GET SINGLE SERVICE
router.get("/:id", getSingleService);


// UPDATE SERVICE
router.put("/:id", protect, updateService);


// DELETE SERVICE
router.delete("/:id", protect, deleteService);


export default router;
