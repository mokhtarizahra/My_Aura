import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    providerType: {
      type: String,
      enum: ["professional", "organization"],
      required: true,
      index: true,
    },

    professionalProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProfessionalProfile",
      default: null,
      index: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    durationInMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: ["draft", "published", "inactive", "archived"],
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;
