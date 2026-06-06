import User from "../models/User.js";
import Profile from "../models/profile.js";
import MatchRequest from "../models/MatchRequest.js";

// Deactive account
export const deactivateAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        // find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // If it was previously disabled
        if (user.status === "inactive") {
            return res.status(400).json({
                success: false,
                message: "You account is already deactivated"
            });
        }

        user.status = "inactive";
        await user.save();

        res.json({ success: true, message: "Account successfully deactivated" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Reactive account
export const reactivateAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        if (user.status !== "inactive") {
            return res.status(400).json({ success: false, message: "Your account is not inactive" });
        }

        user.status = "active";
        await user.save();

        res.json({ success: true, message: "Your account is now active" });

    } catch (error) {
        res.status(500).json({success: false, message: "Server error"});
    }

}; 

// Delete account
export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        // if (!userId) {
        //     return res.status(400).json({ success: false, message: "User not found" });
        // }

        // delete user, match, profile
        await Profile.findOneAndDelete({user: userId});
        await MatchRequest.deleteMany ({
            $or: [{ requester: userId }, { recipient: userId }]
        });
        await User.findByIdAndDelete(userId);

        res.json({success: true, message: "Your account has been permanently deleted"});
        
    } catch (error) {
        res.status(500).json({success: false, message: "Server error"});
    }
};