import mongoose from "mongoose";

const organizationAccountSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    status: {
      type: String,
      enum: ["pending", "active", "inactive", "suspended"],
      default: "pending",
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

const OrganizationAccount = mongoose.model(
  "OrganizationAccount",
  organizationAccountSchema,
);

export default OrganizationAccount;
