import express from "express";
import { sendMessage, getMessages } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// router.get("/ping", (req, res) => {
//   res.json({ message: "chat route works" });
// });

router.post("/send", protect, sendMessage);
router.get("/:conversationId", protect, getMessages);

export default router;
