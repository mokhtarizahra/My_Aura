import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        city: {
            type: String,
            trim: true,
        },

        age: {
            type: Number,
            min: 1,
            max: 120,
        },

        skills: [
            {
                type: String,
                trim: true,
            },
        ],
        interests: [
            {
                type: String,
                trim: true,
            },
        ],

        photos: [
            {
                type: String,
            },
        ],

        bio: {
            type: String,
            trim: true,
            maxlength: 500,
        },
    },
    
    {
        timestamps: true,
    }
);

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;