import mongoose from "mongoose";

const organizationProfileSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      unique: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    logo: {
      type: String,
      trim: true,
      default: "default-organization-logo.png",
    },

    website: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },

    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    city: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    socialLinks: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const OrganizationProfile = mongoose.model(
  "OrganizationProfile",
  organizationProfileSchema,
);

export default OrganizationProfile;
