import mongoose from "mongoose";

const teamGoalSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalUser",
      required: true,
      index: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalUser",
      default: null,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    estimatedHours: {
      type: Number,
      min: 0,
      default: 0,
    },

    startDate: {
      type: Date,
      default: null,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    createdFor: {
      type: String,
      enum: ["team", "individual"],
      default: "team",
      index: true,
    },

    hasSteps: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
      index: true,
    },

    category: {
      type: String,
      enum: [
        "sports",
        "education",
        "language",
        "personal_growth",
        "nutrition",
        "other",
      ],
      default: "other",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const TeamGoal = mongoose.model("TeamGoal", teamGoalSchema);

export default TeamGoal;
