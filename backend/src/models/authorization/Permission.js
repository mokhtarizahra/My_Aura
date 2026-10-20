import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    resource: {
      type: String,
      required: true,
      index: true,
    },

    action: {
      type: String,

      required: true,

      trim: true,

      maxlength: 50,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

const Permission = mongoose.model("Permission", permissionSchema);

export default Permission;
