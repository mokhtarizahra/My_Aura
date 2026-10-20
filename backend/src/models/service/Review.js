import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonalUser",
      required: true,
      index: true,
    },

    targetType: {
      type: String,
      enum: ["professional", "service", "organization"],
      required: true,
      index: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ["published", "hidden", "reported"],
      default: "published",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index(
  {
    reviewerId: 1,
    targetType: 1,
    targetId: 1,
  },
  {
    unique: true,
  },
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
