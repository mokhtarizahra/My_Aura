import mongoose from "mongoose";

const teamChatSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const TeamChat = mongoose.model("TeamChat", teamChatSchema);

export default TeamChat;
