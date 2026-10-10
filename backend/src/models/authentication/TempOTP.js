import mongoose from "mongoose";

const tempOTPSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    identifierType: {
      type: String,
      enum: ["phone", "email"],
      required: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
      select: false,
    },

    purpose: {
      type: String,
      enum: [
        "registration",
        "password_reset",
        "email_verification",
        "phone_verification",
      ],
      default: "registration",
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

tempOTPSchema.index(
  {
    identifier: 1,
    purpose: 1,
  },
  {
    unique: true,
  },
);

const TempOTP = mongoose.model("TempOTP", tempOTPSchema);

export default TempOTP;
