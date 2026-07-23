import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],

    status: {
        type: String,
        enum: ["active", "blocked", "removed"],
        default: "active"
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
},
    { timestamps: true }
);

// prevent duplicate matches between two useres
matchSchema.index({ users: 1 });

export default mongoose.model("Match", matchSchema);