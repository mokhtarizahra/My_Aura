import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["club", "institute"],
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    status: {
      type: String,
      enum: ["pending", "active", "suspended", "restricted", "deactivated"],
      default: "pending",
      index: true,
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },

    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },

      totalReviews: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

const Organization = mongoose.model("Organization", organizationSchema);

export default Organization;
