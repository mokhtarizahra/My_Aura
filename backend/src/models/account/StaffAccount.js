import mongoose from "mongoose";

const staffAccountSchema = new mongoose.Schema(
  {
    staffUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StaffUser",
      required: true,
      unique: true,
      index: true,
    },

    corporateEmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },

    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const StaffAccount = mongoose.model("StaffAccount", staffAccountSchema);

export default StaffAccount;
