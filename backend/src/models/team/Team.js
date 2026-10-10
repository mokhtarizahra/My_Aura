import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    category: {
      type: String,
      enum: [
        "sports",
        "education",
        "language",
        "personal_growth",
        "art",
        "other",
      ],
      default: "other",
      index: true,
    },

    teamType: {
      type: String,
      enum: ["peer", "professional", "organization"],
      required: true,
      index: true,
    },

    ownershipType: {
      type: String,
      enum: ["members", "manager", "organization"],
      required: true,
      index: true,
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalUser",
      default: null,
      index: true,
    },

    managerVerificationStatus: {
      type: String,
      enum: ["verified", "unverified", "not_applicable"],
      default: "not_applicable",
      index: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalUser",
      required: true,
      index: true,
    },

    joinPolicy: {
      type: String,
      enum: ["open", "approval_required"],
      default: "approval_required",
    },

    decisionPolicy: {
      type: String,
      enum: ["manager", "unanimous"],
      default: "unanimous",
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const Team = mongoose.model("Team", teamSchema);

export default Team;
