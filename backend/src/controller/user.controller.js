import Client from "../lib/twilioServices.js";
import User from "../modal/user.modal.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "2y", // 2 year
  });
};

export const RegisterUserWithPhone = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // BUG FIX: Check if user exists. If not, create a "pending" user.
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({
        phone,
        verified: false,
        balance: 0,
      });

      await user.save();
    }

    // Send OTP via Twilio
    await Client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_ID)
      .verifications.create({
        to: phone,
        channel: "sms",
      });

    return res.status(200).json({
      message: "OTP sent successfully",
      success: true,
    });
  } catch (error) {
    console.error("Twilio Error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to send OTP", error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res
        .status(400)
        .json({ message: "Phone number and OTP are required" });
    }

    const result = await Client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_ID)
      .verificationChecks.create({
        to: phone,
        code: code,
      });

    if (result.status !== "approved") {
      return res.status(400).json({
        message: "Invalid or expired OTP",
        success: false,
      });
    }

    // BUG FIX: Use findOneAndUpdate to mark as verified
    const user = await User.findOneAndUpdate(
      { phone },
      { verified: true },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User record not found" });
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      message: "OTP verified successfully",
      success: true,
      user, // Optionally return user data or a JWT token here
      token,
    });
  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required to resend OTP",
      });
    }

    // 1. Verify the user actually exists in your DB before sending another SMS
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No pending registration found for this number",
      });
    }

    // 2. Trigger Twilio to send a new code
    // Twilio Verify automatically handles the "resend" logic if you call .create again
    await Client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_ID)
      .verifications.create({
        to: phone,
        channel: "sms",
      });

    return res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your phone",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error.message);

    // Handle Twilio-specific rate limiting (e.g., user requesting too fast)
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please wait a moment before trying again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
      error: error.message,
    });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Get My Profile Error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};


