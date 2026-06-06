import { response } from "express";
import mongoose from "mongoose";

const matchRequestSchema = new mongoose.Schema(
    {
      requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
      respondedAt: {
        type: Date,
      },
    },
    { timestamps: true }
  );

  // prevent duplicate requests
  matchRequestSchema.index(
    {requester: 1 , recipient: 1},
    {unique: true},
  );

  export default mongoose.model("MatchRequest", matchRequestSchema);