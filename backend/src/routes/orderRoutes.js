import express from "express";

import {
  createOrder,
  getMyOrders,
  getSales,
  getSingleOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// CREATE ORDER
router.post("/", protect, createOrder);


// BUYER ORDERS
router.get("/my", protect, getMyOrders);


// SELLER ORDERS
router.get("/sales", protect, getSales);


// SINGLE ORDER
router.get("/:id", protect, getSingleOrder);


// UPDATE ORDER STATUS
router.put("/:id", protect, updateOrderStatus);


export default router;
