import mongoose from "mongoose";

const personalUserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const PersonalUser = mongoose.model("PersonalUser", personalUserSchema);

export default PersonalUser;
