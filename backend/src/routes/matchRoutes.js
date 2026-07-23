import express from "express";
import {sendMatchRequest , respondToMatchRequest,
        getReceivedRequests , getSentRequests,
        cancelMatchReuest } from "../controllers/matchController.js";
import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();

// send a firend request
router.post("/request", protect, sendMatchRequest);

// reply request
router.put("/respond", protect , respondToMatchRequest);

// get Received request
router.get("/received", protect , getReceivedRequests);

// get Send request
router.get("/sent", protect , getSentRequests);

// cancel request 
router.delete("/request/:requestId", protect , cancelMatchReuest);

export default router;