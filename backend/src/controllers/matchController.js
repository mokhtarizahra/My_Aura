import { request } from "express";
import MatchRequest from "../models/MatchRequest.js";
import Match from "../models/Match.js";

//send Request
export const sendMatchRequest = async (req, res) => {
    try {
        const requesterId = req.user.id;
        const { recipientId } = req.body;

        if (requesterId === recipientId) {
            return res.status(400).json({ message: "You cannot send request to your to yourself" });
        }

        // check previous request
        const existingRequest = await MatchRequest.findOne({
            requester: requesterId,
            recipient: recipientId,
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Request already sent" });
        }

        const matchRequest = await MatchRequest.create({
            requester: requesterId,
            recipient: recipientId,
        });

        res.status(201).json(matchRequest);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// respond request
export const respondToMatchRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { requestId, action } = req.body;

        // To find request
        const matchRequest = await MatchRequest.findById(requestId);

        if (!matchRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        // just recipient can reply
        if (matchRequest.recipient.toString() !== userId) {
            return res.status(403).json({ message: "You are not allowed to respond to this request" });
        }

        // Check the validity of the action
        if (action !== "accept" && action !== "reject") {
            return res.status(400).json({ message: "Invalid action" });
        }

        // if already answered
        if (matchRequest.status !== "pending"){
            return res.status(400).json({message: "Request already responded"});
        }

        //if rejected
        if (action === "reject") {
            matchRequest.status = "rejected";
            matchRequest.respondedAt = new Date();
            await matchRequest.save();

            return res.json(matchRequest);
        }

        // accepted
        matchRequest.status = "accepted";
        matchRequest.respondedAt = new Date();
        await matchRequest.save();

        const userA = matchRequest.requester;
        const userB = matchRequest.recipient;

        // Unique order to avoid duplicates
        const users = [userA , userB].sort();

        // check for the existence of a previus Match
        const existeningMatch = await Match.findOne({users: {$all: users}});

        if (!existeningMatch) {
            await Match.create({users, status: "active"});
        }

        res.json({message: "Match accepted and created successfully", matchRequest});

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Receive Request
export const getReceivedRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await MatchRequest.find({ recipient: userId })
            .populate("requester", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: requests.length,
            requests,
        });
    } catch (error) {
        res.status(500).json({
            message: "Faild to get received requests",
            error: error.message,
        });
    }
};

// Get send Request
export const getSentRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        // find requests sent by the logined user
        const requests = await MatchRequest.find({requester: userId })
            .populate("recipient", "name email") 
            .sort({ createdAt: -1 });
      
          res.status(200).json({
            count: requests.length,
            requests,
          });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get sent requests",
            error: error.message,
        });
    }
};

// Cancel request
export const cancelMatchReuest = async (req, res) => {
    try {
        const {requestId} = req.params;
        const userId = req.user.id;

        const deletedRequest = await MatchRequest.findOneAndDelete({
            _id: requestId,
            requester: userId,
            status: "pending"
        });

        if(!deletedRequest) {
            return res.status(404).json({
                message: "Pending request not found or you are allowed to cancel it " 
            });
        }

        return res.status(200).json({message: "Match request canceled successfully"});

    } catch (error) {
        return res.status(500).json({
            message: "Server error", 
            error: error.message
        });
    }
};