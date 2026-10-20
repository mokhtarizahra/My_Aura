import mongoose from "mongoose";

const organizationMembershipSchema = new mongoose.Schema(
  {
    personalUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalUser",
      required: true,
      index: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    membershipRole: {
      type: String,
      enum: ["manager", "coach", "teacher", "student", "athlete"],
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "suspended", "inactive"],
      default: "active",
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

organizationMembershipSchema.index(
  {
    personalUserId: 1,
    organizationId: 1,
  },
  {
    unique: true,
  },
);

const OrganizationMembership = mongoose.model(
  "OrganizationMembership",
  organizationMembershipSchema,
);

export default OrganizationMembership;
