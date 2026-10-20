import mongoose from "mongoose";

const professionalProfileSchema = new mongoose.Schema(
  {
    personalUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalUser",
      required: true,
      unique: true,
      index: true,
    },

    professionTypes: [
      {
        type: String,
        enum: ["coach", "teacher", "skill_provider"],
      },
    ],

    skills: [
      {
        type: String,
        trim: true,
        maxlength: 100,
      },
    ],

    headline: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    biography: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    yearsOfExperience: {
      type: Number,
      min: 0,
      default: 0,
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

const ProfessionalProfile = mongoose.model(
  "ProfessionalProfile",
  professionalProfileSchema,
);

export default ProfessionalProfile;
