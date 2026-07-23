import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        content: {
            type: String,
            trim: true,
            maxlength: 2000
        },

        type: {
            type: String,
            enum: ["text", "image", "voice"],
            default: "text"
        },

        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        deletedFor: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },

    { timestamps: true }
);

chatSchema.index({ conversation: 1, createdAt: -1});

export default mongoose.model("Chat", chatSchema);