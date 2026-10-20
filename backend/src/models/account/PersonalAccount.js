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
      // Index + uniqueness enforced via partial index below
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      // Index + uniqueness enforced via partial index below
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

/**
 * Partial unique index for email.
 *
 * Only documents that actually have a string email are constrained.
 * Documents without email (null or missing) are NOT included,
 * so multiple accounts without email can coexist.
 */
personalAccountSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $type: "string" } },
  },
);

/**
 * Partial unique index for phone.
 *
 * Same rationale as email — only accounts that actually have
 * a phone string are constrained.
 */
personalAccountSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: { phone: { $type: "string" } },
  },
);

const PersonalAccount = mongoose.model(
  "PersonalAccount",
  personalAccountSchema,
);

export default PersonalAccount;