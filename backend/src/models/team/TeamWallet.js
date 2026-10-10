import mongoose from "mongoose";

const teamWalletSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      unique: true,
      index: true,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "IRR",
    },

    status: {
      type: String,
      enum: ["active", "frozen", "closed"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const TeamWallet = mongoose.model("TeamWallet", teamWalletSchema);

export default TeamWallet;
