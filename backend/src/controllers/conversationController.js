import Conversation from "../models/conversation.js";
import Chat from "../models/chat.js";

// get a list of all user conversations
export const getMyConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        const conversations = await Conversation.find({ participants: userId })
            .populate({ path: "participants", select: "_id name avatar" })
            .populate({ path: "lastMessage", select: "_id content sender createdAt readBy" })
            .sort({ lastMessageAt: -1 });

        // caculate unread count for each conversation 
        const formatted = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await Chat.countDocuments({
                    conversation: conv._id,
                    sender: { $ne: userId },
                    readBy: { $ne: userId }
                });

                const receiver = conv.participants.find(
                    (p) => p._id.toString() !== userId.toString()
                );

                return {
                    _id: conv._id,
                    participants: receiver,
                    lastMessage: conv.lastMessage,
                    lastMessageAt: conv.lastMessageAt,
                    unreadCount,
                };
            })
        );

        res.status(200).json({ conversations: formatted });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// get details of a specific conversation
export const getConversationById = async (req, res) => {
    try {
        const userId = req.user._id;
        const { conversationId } = req.params;

        const conversation = await Conversation.findById(conversationId)
            .populate({ path: "participants", select: "_id name avatar" })
            .populate({ path: "lastMessage", select: "_id content sender createdAt readBy" });

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (!conversation.participants.map((p) => p._id.toString()).includes(userId.toString())) {
            return res.status(403).json({ message: "Access denied" });
        }

        // number of unread messages in this conversation 
        const unreadCount = await Chat.countDocuments({
            conversation: conversationId,
            sender: { $ne: userId },
            readBy: { $ne: userId }
        });

        res.status(200).json({ conversation, unreadCount });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// mark all messages as read
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const { conversationId } = req.params;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        await Chat.updateMany(
            {
                conversation: conversationId,
                sender: { $ne: userId },
                readBy: { $ne: userId }
            },
            { $push: { readBy: userId } }
        );

        res.status(200).json({ message: "All messages marked as read" });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Archive conversation
export const archiveConversation = async (req, res) => {
    try {
        const userId = req.user._id;
        const { conversationId } = req.params;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        conversation.isArchived.set(userId.toString(), true);
        await conversation.save();

        res.status(200).json({ message: "Conversation archived" });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};