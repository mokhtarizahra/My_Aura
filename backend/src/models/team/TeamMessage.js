import mongoose from "mongoose";

const teamMessageSchema = new mongoose.Schema(
  {
    teamChatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamChat",
      required: true,
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalUser",
      required: true,
      index: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    messageType: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
      index: true,
    },

    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const TeamMessage = mongoose.model("TeamMessage", teamMessageSchema);

export default TeamMessage;
