import mongoose from "mongoose";

const goalProgressSchema = new mongoose.Schema(
  {
    goalStepId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GoalStep",
      required: true,
      index: true,
    },

    personalUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalUser",
      required: true,
      index: true,
    },

    progressStatus: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
      index: true,
    },

    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    checkedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

goalProgressSchema.index(
  {
    goalStepId: 1,
    personalUserId: 1,
  },
  {
    unique: true,
  },
);

const GoalProgress = mongoose.model("GoalProgress", goalProgressSchema);

export default GoalProgress;
