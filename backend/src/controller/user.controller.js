import Client from "../lib/twilioServices.js";
import User from "../modal/user.modal.js";
import dotenv from "dotenv";
dotenv.config();

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

    return res.status(200).json({
      message: "OTP verified successfully",
      success: true,
      user, // Optionally return user data or a JWT token here
    });
  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
