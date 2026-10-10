import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    accountType: {
      type: String,
      enum: ["personal", "organization", "staff"],
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      // index: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    ip: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

refreshTokenSchema.index({
  accountId: 1,
  accountType: 1,
});

refreshTokenSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  },
);

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
