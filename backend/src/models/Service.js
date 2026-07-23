import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  isActive: {
    type: Boolean,
    default: true,
  },
  
  deliveryTime: {
    type: Number,
    required: true,
  },
  ratingAverage: {
    type: Number,
    default: 0
  },
  
  ratingCount: {
    type: Number,
    default: 0
  }  
  
},
{
  timestamps: true
}
);

export default mongoose.model("Service", serviceSchema);
