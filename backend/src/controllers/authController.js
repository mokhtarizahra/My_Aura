import User from "../models/User.js";
import { sendOTP } from "../services/otp.service.js";
import { generateToken } from "../services/token.service.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/RefreshToken.js";
import { hashToken } from "../utils/hashToken.js";

export const requestOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    await sendOTP(phone);

    res.status(200).json({ success: true, message: "OTP send successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone });

    if (!user || !user.otpHash || !user.otpExpire) {
      return res.status(400).json({ success: false, message: "Invalid or expired request" });
    }

    // check the expiration time
    if (Date.now() > user.otpExpire) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const isValid = await bcrypt.compare(otp.toString(), user.otpHash);

    if (!isValid) {
      return res.status(400).json({ success: false, message: "invalid otp" });
    }

    // OTP is consumed
    user.otpHash = null;
    user.otpExpire = null;
    user.isVerified = true;

    await user.save();

    const resetToken = generateToken(
      { sub: user._id, type: "password_reset" },
      "10m"
    );

    res.status(200).json({ success: true, resetToken, user: { id: user._id, phone: user.phone } });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "otp verification failed" });
  }
};

export const loginWithPassword = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone }).select("+password");

    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ success: false, message: "Account is not active" });
    }

    const sessions = await RefreshToken.countDocuments({ user: user._id });
    
    if (sessions >= 5) {
      await RefreshToken.findOneAndDelete({ user: user._id }).sort({ createdAt: 1 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateToken(
      { sub: user._id, type: "access", role: user.role },
      "15m"
    );

    const refreshToken = generateToken(
      { sub: user._id, type: "refresh", role: user.role },
      "7d"
    );

    await RefreshToken.create({
      user: user._id,
      token: hashToken(refreshToken),
      userAgent: req.headers["user-agent"],
      ip: req.ip,
      lastUsedAt: new Date()
    });

    // Set cookie for user role
     res.cookie('userRole', user.role, {
      httpOnly: true,  // Only the server can read it (high security)
      secure: process.env.NODE_ENV === 'production',  // HTTPS only
      sameSite: 'lax',  // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000  
    });

    return res.status(200).json({ success: true,  accessToken, refreshToken, 
      user: { 
          id: user._id, 
          phone: user.phone, 
          role: user.role, 
          status: user.status 
      } 
  });

  } catch (error) {
    res.status(500).json({ success: false, message: "login failed" });
  }
};

export const setPassword = async (req, res) => {
  try {

    if (req.tokenType !== "password_reset") {
      return res.status(403).json({ success: false, message: "Invalid token type" });
    }
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = req.user;
    user.password = await bcrypt.hash(password, 12);

    await user.save();

    const accessToken = generateToken(
      { sub: user._id, type: "access", role: user.role },
      "15m"
    );

    const refreshToken = generateToken(
      { sub: user._id, type: "refresh", role: user.role },
      "7d"
    );

    await RefreshToken.deleteMany({ user: user._id });
    await RefreshToken.create({
      user: user._id,
      token: hashToken(refreshToken),
      userAgent: req.headers["user-agent"],
      ip: req.ip,
      lastUsedAt: new Date()
    });

     // Cookie Settings
    res.cookie('userRole', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });
    
    res.status(200).json({ success: true, accessToken, refreshToken, 
      user: { id: user._id, phone: user.phone, role: user.role, status: user.status },
      message: "Password updated successfully" 
  });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "failed to set password" });
  }

};

export const refreshAccessToken = async (req, res) => {
  try {

    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token required" });
    }

    let payload;

    try {
      payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    if (payload.type !== "refresh") {
      return res.status(403).json({ success: false, message: "Invalid token type" });
    }

    const storedToken = await RefreshToken.findOne({
      token: hashToken(refreshToken),
      user: payload.sub
    });

    if (!storedToken) {
      return res.status(401).json({ success: false, message: "Refresh token revoked" });
    }

    const user = await User.findById(payload.sub);

    if (!user || user.status !== "active") {
      return res.status(403).json({ success: false, message: "Account not active" });
    }

    const newAccessToken = generateToken(
      { sub: user._id, type: "access", role: user.role },
      "15m"
    );

    const newRefreshToken = generateToken(
      { sub: user._id, type: "refresh", role: user.role },
      "7d"
    );

    storedToken.lastUsedAt = new Date();
    await storedToken.deleteOne();

    await RefreshToken.create({
      user: user._id,
      token: hashToken(newRefreshToken),
      userAgent: req.headers["user-agent"],
      ip: req.ip,
      lastUsedAt: new Date()
    });


    res.json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token required" });
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

    await RefreshToken.deleteOne({ token: hashToken(refreshToken), user: payload.sub });

    // Clear cookies
    res.clearCookie('userRole');
    res.clearCookie('accessToken');

    res.json({ success: true, message: "Logged out" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

export const getSessions = async (req, res) => {

  const sessions = await RefreshToken.find({ user: req.user._id })
    .select("-token");

  res.json({ success: true,sessions});

};

export const revokeSession = async (req, res) => {

  await RefreshToken.deleteOne({
    _id: req.params.id,
    user: req.user._id
  });

  res.json({ success: true });

};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: "شماره موبایل الزامی است" 
      });
    }

    // Check for user existence
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "کاربری با این شماره یافت نشد" 
      });
    }

    // Check user status
    if (user.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: "حساب کاربری شما فعال نیست" 
      });
    }

    // Send a new OTP (same as the sendOTP function)
    await sendOTP(phone);

    // Log for review (optional)
    console.log(`OTP resent to ${phone} at ${new Date().toISOString()}`);

    res.status(200).json({ 
      success: true, 
      message: "کد تأیید مجدداً ارسال شد" 
    });

  } catch (error) {
    console.error('Error in resendOTP:', error);
    res.status(500).json({ 
      success: false, 
      message: "خطا در ارسال مجدد کد تأیید" 
    });
  }
};