import express from "express";
import {
    getMyConversations,
    getConversationById,
    markAsRead,
    archiveConversation
} from "../controllers/conversationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// list of user conversation
router.get("/", protect, getMyConversations);

// details of conversation
router.get("/:conversationId", protect, getConversationById);

// Mark as read
router.put("/:conversationId/mark-read", protect, markAsRead);

// archive conversation
router.put("/:conversationId/archive", protect, archiveConversation);

export default router;
