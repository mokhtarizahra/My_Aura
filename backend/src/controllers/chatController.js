import Conversation from "../models/conversation.js";
import Chat from "../models/chat.js";
import Match from "../models/Match.js";

export const sendMessage = async (req, res) => {
  try {
    const sender = req.user._id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: "receiverId and content required" });
    }

    // Check match
    const match = await Match.findOne({
      users: { $all: [sender, receiverId] },
      status: "active"
    });

    if (!match) {
      return res.status(403).json({ message: "No active match found" });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [sender, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [sender, receiverId],
        match: match._id
      });
    }

    // Create message
    const message = await Chat.create({
      conversation: conversation._id,
      sender,
      content
    });

    // Update conversation info
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.status(201).json({
      message: "Message sent",
      data: message
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get messages 
export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Chat.find({ conversation: conversationId })
      .sort({ createdAt: 1 });

    res.status(200).json(messages);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
