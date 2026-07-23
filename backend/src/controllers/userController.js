import Profile from "../models/profile.js";

export const searchUsers = async (req, res) => {
    try {
        const { name, city, skills, interests, page = 1, limit = 10 } = req.query;

        let query = {};

        if (city) {
            query.city = city;
        }

        if (skills) {
            query.skills = { $in: skills.split(",") };
        }

        if (interests) {
            query.interests = { $in: interests.split(",") };
        }

        const cleanName = name?.trim();

        const profiles = await Profile.find(query)
            // .populate("user", ["name","email","avatar"])
            .populate({
                path: "user", select: "name email avatar"
                , match: name ? { name: { $regex: new RegExp(cleanName, "i") } } // filter on User.name 
                    : {},
            })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const filteredProfiles = profiles.filter((p) => p.user);

        res.json({
            success: true,
            count: filteredProfiles.length,
            profiles: filteredProfiles
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};