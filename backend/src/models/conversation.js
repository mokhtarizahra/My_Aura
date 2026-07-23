import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema (
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref:"User",
                required: true
            }
        ],

        match: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Match",
            required: true,
            index: true
        },

        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            default: null
        },

        lastMessageAt: {
            type: Date,
            default: Date.now,
        },

        isMauted: {
            type: Map,
            of: Boolean,
            default: {}
        }
    },

    {timestamps: true}
);

conversationSchema.index({ participants: 1 });

export default mongoose.model( "Conversation", conversationSchema );