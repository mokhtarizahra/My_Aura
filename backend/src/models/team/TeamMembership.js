import mongoose from "mongoose";

const teamMembershipSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },

    personalUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalUser",
      required: true,
      index: true,
    },

    membershipRole: {
      type: String,
      enum: ["manager", "group_leader", "member"],
      default: "member",
      index: true,
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalUser",
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "active", "left", "removed", "blocked"],
      default: "pending",
      index: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

teamMembershipSchema.index(
  {
    teamId: 1,
    personalUserId: 1,
  },
  {
    unique: true,
  },
);

const TeamMembership = mongoose.model("TeamMembership", teamMembershipSchema);

export default TeamMembership;
