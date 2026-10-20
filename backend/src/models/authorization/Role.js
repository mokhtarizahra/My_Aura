import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },

    scope: {
      type: String,

      enum: ["platform"],

      default: "platform",

      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const Role = mongoose.model("Role", roleSchema);

export default Role;
