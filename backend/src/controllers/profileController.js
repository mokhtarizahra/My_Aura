import Profile from "../models/profile.js";

// create or Update profile
export const createOrUpdateProfile = async (req, res) => {
    try{
        const userId = req.user._id // from authMiddleware
        
        const {city, age, skills, interests, photos, bio} = req.body;

        const profileData = {
            user: userId,
            city,
            age,
            skills,
            photos,
            bio,
            interests,
        };

        // if profile exist, update
        let profile = await Profile.findOneAndUpdate(
            {user: userId},
            profileData,
            {new : true, upsert: true}
        );

        res.json({
            success: true,
            message: "Profile saved successfully",
            profile,
        });
    } catch (error){
        console.error("Profile create/update error:", error);
        res.status(500).json({success: false, message: "Server error"});
    }
};

// Get user profile
export const getMyProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user._id}).populate(
            "user",
            "name email avatar"
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }
        res.json({success: true, profile});
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({success: false, message: "Server error"});
    }
};
