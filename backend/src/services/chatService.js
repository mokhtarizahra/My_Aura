import Conversation from "../models/conversation.js";
import Chat from "../models/chat.js";
import Match from "../models/Match.js";

export const sendMessageService = async ({ sender, receiverId, content }) => {

  if (!receiverId || !content) {
    throw new Error("receiverId and content required");
  }

  const match = await Match.findOne({
    users: { $all: [sender, receiverId] },
    status: "active"
  });

  if (!match) {
    throw new Error("No active match found");
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [sender, receiverId] }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [sender, receiverId],
      match: match._id
    });
  }

  const message = await Chat.create({
    conversation: conversation._id,
    sender,
    content
  });

  conversation.lastMessage = message._id;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  return { conversation, message };
};
