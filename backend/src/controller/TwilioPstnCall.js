import twilio from "twilio";
import User from "../modal/user.modal.js";
import dotenv from "dotenv";
import Call from "../modal/calls.modal.js";
import twilioClient from "../lib/twilioServices.js";
dotenv.config();

const TwilioClient = twilioClient;

// Pricing constants
const TwilioCostPricePerMinute = 0.335;
const EricallProfitMargin = 0.4;
const PricePerMinute = TwilioCostPricePerMinute * (1 + EricallProfitMargin);
const PricePerSecond = PricePerMinute / 60;

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

export const GenerateAccessToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const identity = `user_${userId}`;

    const accessToken = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_SID,
      process.env.TWILIO_API_SECRECT,
      { identity: identity }
    );

    const grant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
      incomingAllow: true, // Allow incoming calls if needed later
    });

    accessToken.addGrant(grant);

    res.status(200).json({
      identity: identity,
      token: accessToken.toJwt(),
    });
  } catch (error) {
    console.error("GenerateAccessToken Error:", error);
    res.status(500).json({ message: "Failed to generate token", error: error.message });
  }
};

export const MakeCall = async (req, res) => {
  try {
    let { phone } = req.body;
    const userId = req.user.id;

    if (!phone) return res.status(400).json({ message: "Phone is required" });

    // Prevent duplicate calls: Check if a call for this user is already ringing or in-progress
    const activeCall = await Call.findOne({
      userId,
      status: { $in: ["ringing", "in-progress"] },
      createdAt: { $gt: new Date(Date.now() - 60000) } // within last 60 seconds
    });

    if (activeCall) {
      console.log(`Duplicate call attempt blocked for user: ${userId}`);
      return res.status(200).json({ message: "Call already in progress", callId: activeCall.twilioCallId });
    }

    console.log(`Initiating PSTN call: User ${userId} -> ${phone}`);

    // Ensure E.164 Format
    if (phone.startsWith("00")) {
      phone = "+" + phone.substring(2);
    } else if (!phone.startsWith("+")) {
      phone = "+" + phone;
    }

    const user = await User.findById(userId);
    if (!user || !user.phone || user.balance < PricePerMinute) {
      return res
        .status(400)
        .json({ message: "Insufficient balance or user phone missing" });
    }

    // Sanitize User Phone (Initiator)
    let userPhone = user.phone;
    if (userPhone.startsWith("00")) {
      userPhone = "+" + userPhone.substring(2);
    } else if (!userPhone.startsWith("+")) {
      userPhone = "+" + userPhone;
    }

    // Initiate the Outbound Call to the USER first
    const call = await twilioClient.calls.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: userPhone,

      // The webhook will dial the recipient (phone) once the user answers
      url: `${process.env.DOMAIN_URL}/api/v1/calls/voice-webhook?target=${encodeURIComponent(phone)}`,
      statusCallback: `${process.env.DOMAIN_URL}/api/v1/calls/call-status?userId=${userId}`,
      statusCallbackEvent: ["completed"],
    });

    const calling = new Call({
      userId,
      phoneNumber: phone,
      duration: 0,
      TotalCost: 0,
      status: "ringing",
      twilioCallId: call.sid,
    });
    await calling.save();

    return res.status(200).json({ message: "Dialing...", callId: call.sid });
  } catch (error) {
    console.error("MakeCall Error:", error);
    // If you see error 13225 here, you MUST contact Twilio support to whitelist Eritrea
    return res
      .status(500)
      .json({ message: "Call failed", error: error.message });
  }
};

export const TwilioWebhook = async (req, res) => {
  const targetNumber = req.query.target || req.body.target || req.body.To;
  const response = new twilio.twiml.VoiceResponse();

  console.log("Twilio Webhook Target:", targetNumber);

  if (targetNumber && targetNumber.startsWith('+')) {
    // If it's a PSTN number, dial it
    const dial = response.dial({
      callerId: process.env.TWILIO_PHONE_NUMBER,
    });
    dial.number(targetNumber);
  } else if (targetNumber) {
    // If it's a client identity, dial the client
    const dial = response.dial();
    dial.client(targetNumber);
  } else {
    response.say("Error: No destination provided.");
  }

  res.type("text/xml");
  res.send(response.toString());
};

export const CallStatus = async (req, res) => {
  try {
    // For a direct call status callback, Twilio sends CallStatus and CallDuration
    const { CallStatus: twilioStatus, CallDuration, CallSid } = req.body;
    const { userId } = req.query;

    let durationSeconds = parseInt(CallDuration || "0", 10);

    const call = await Call.findOne({ twilioCallId: CallSid });
    if (!call) {
      return res
        .status(200)
        .json({ message: "Call log record not found (Status Callback)" });
    }

    call.status = twilioStatus || "failed";

    if (call.status === "completed") {
      let finalCost = durationSeconds * PricePerSecond;
      finalCost = Math.round(finalCost * 10000) / 10000;

      call.duration = durationSeconds;
      call.TotalCost = finalCost;

      await User.findByIdAndUpdate(userId, {
        $inc: { balance: -finalCost },
      });
    } else {
      call.duration = 0;
      call.TotalCost = 0;
    }

    await call.save();
    return res
      .status(200)
      .json({ message: "Call billing updated successfully" });
  } catch (error) {
    console.error("Twilio CallStatus Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetCallsHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const calls = await Call.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, calls });
  } catch (error) {
    console.error("GetCallsHistory Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
