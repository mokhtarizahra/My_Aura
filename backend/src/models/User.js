import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    // required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },

  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },

  password: {
    type: String,
    // required: true,
    minlength: 6,
    select: false,
  },

  avatar: {
    type: String,
    default: "default-avatar.png",
  },

  role: {
     type: String,
     enum: ["athlete", "sportsComplex_admin", "super_admin"],
     default: "athlete",
  },

  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active",
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  otpHash: String,
  otpExpire: Date,

  lastLogin: Date,
},
{
  timestamps: true,
}
);

const User = mongoose.model("User", userSchema);

export default User;
