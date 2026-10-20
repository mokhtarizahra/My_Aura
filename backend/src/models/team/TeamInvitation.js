import mongoose from "mongoose";

const teamInvitationSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },

    invitationType: {
      type: String,
      enum: ["member", "manager"],
      default: "member",
      index: true,
    },

    invitedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalUser",
      required: true,
      index: true,
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalUser",
      required: true,
      index: true,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "expired", "cancelled"],
      default: "pending",
      index: true,
    },

    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

teamInvitationSchema.index(
  {
    teamId: 1,
    invitedUserId: 1,
    invitationType: 1,
  },
  {
    unique: true,
  },
);

const TeamInvitation = mongoose.model("TeamInvitation", teamInvitationSchema);

export default TeamInvitation;
