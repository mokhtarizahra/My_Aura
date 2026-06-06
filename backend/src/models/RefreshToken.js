import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  token: {
    type: String,
    required: true,
    unique: true
  },

  userAgent: String,
  ip: String,

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 7
  },

  lastUsedAt: {
    type: Date,
    default: Date.now
  }
});

refreshTokenSchema.index({ user: 1, token: 1 });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
