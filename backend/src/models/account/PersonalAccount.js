import mongoose from "mongoose";

const personalAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalUser",
      required: true,
      unique: true,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
    },

    passwordHash: {
      type: String,
      select: false,
    },

    status: {
      type: String,
      enum: ["pending", "active", "inactive", "suspended"],
      default: "pending",
      index: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const PersonalAccount = mongoose.model(
  "PersonalAccount",
  personalAccountSchema,
);

export default PersonalAccount;
