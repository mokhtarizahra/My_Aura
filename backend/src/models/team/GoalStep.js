import mongoose from "mongoose";

const goalStepSchema = new mongoose.Schema(
  {
    teamGoalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamGoal",
      required: true,
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

    stepOrder: {
      type: Number,
      required: true,
      min: 1,
    },

    startDate: {
      type: Date,
      default: null,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

goalStepSchema.index(
  {
    teamGoalId: 1,
    stepOrder: 1,
  },
  {
    unique: true,
  },
);

const GoalStep = mongoose.model("GoalStep", goalStepSchema);

export default GoalStep;
