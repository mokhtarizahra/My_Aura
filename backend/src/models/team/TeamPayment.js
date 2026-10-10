import mongoose from "mongoose";

const teamPaymentSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },

    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalUser",
      required: true,
      index: true,
    },

    receiverType: {
      type: String,
      enum: ["coach", "organization", "team_wallet"],
      required: true,
      index: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentType: {
      type: String,
      enum: ["membership_fee", "coach_fee", "team_expense"],
      required: true,
      index: true,
    },

    approvalRequired: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    transactionId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const TeamPayment = mongoose.model("TeamPayment", teamPaymentSchema);

export default TeamPayment;
