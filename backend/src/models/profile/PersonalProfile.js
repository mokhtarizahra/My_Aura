import mongoose from "mongoose";

const personalProfileSchema = new mongoose.Schema(
  {
    personalUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalUser",
      required: true,
      unique: true,
      index: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    city: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    avatar: {
      type: String,
      trim: true,
      default: "default-avatar.png",
    },

    interests: [
      {
        type: String,
        trim: true,
        maxlength: 100,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const PersonalProfile = mongoose.model(
  "PersonalProfile",
  personalProfileSchema,
);

export default PersonalProfile;
