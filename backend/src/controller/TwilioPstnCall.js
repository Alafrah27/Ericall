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

export const MakeCall = async (req, res) => {
  try {
    let { phone } = req.body; // The target destination phone
    const userId = req.user.id;

    if (!phone) {
      return res.status(400).json({ message: "Destination phone number is required" });
    }

    // Sanitize phone number: Replace leading '00' with '+' for Twilio E.164 compatibility
    if (phone.startsWith("00")) {
      phone = "+" + phone.substring(2);
    } else if (!phone.startsWith("+")) {
       phone = "+" + phone;
    }

    const user = await User.findById(userId);
    if (!user || !user.phone) {
      return res.status(404).json({ message: "User not found or missing phone number" });
    }

    if (user.balance <= 0) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const MaxMinutes = Math.floor(user.balance / PricePerMinute);
    if (MaxMinutes <= 0) {
      return res.status(400).json({ message: "Insufficient balance for a 1-minute call" });
    }
    
    // 1. Tell Twilio to call the target directly.
    const call = await TwilioClient.calls.create({
      to: phone, // Call the target directly
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${process.env.DOMAIN_URL}/api/v1/calls/voice-webhook?userId=${userId}`,
      statusCallback: `${process.env.DOMAIN_URL}/api/v1/calls/call-status?userId=${userId}`,
    });

    // 2. Save the pending call (0 cost initially)
    const calling = new Call({
      userId,
      phoneNumber: phone, // target number
      duration: 0,
      TotalCost: 0,
      status: "ringing",
      twilioCallId: call.sid,
    });
    await calling.save();

    return res.status(200).json({
      message: "Dialing your phone now...",
      callId: call.sid,
      PricePerMinute,
      maxMinutes: MaxMinutes
    });
  } catch (error) {
    console.error("Twilio MakeCall Error Details:", error);
    return res.status(500).json({ message: "Failed to initiate PSTN call", error: error.message });
  }
};

export const TwilioWebhook = async (req, res) => {
  try {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    response.say("Welcome to Ericall. This is a secure system-initiated call.");
    // Add more TwiML here as needed (e.g. <Play>, <Record>, <Gather>)
    
    res.type("text/xml");
    res.send(response.toString());
  } catch (error) {
    console.error("Twilio Webhook Error:", error);
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    response.say("An error occurred connecting your call.");
    res.type("text/xml");
    res.send(response.toString());
  }
};

export const CallStatus = async (req, res) => {
  try {
    // For a direct call status callback, Twilio sends CallStatus and CallDuration
    const { CallStatus: twilioStatus, CallDuration, CallSid } = req.body;
    const { userId } = req.query;
    
    let durationSeconds = parseInt(CallDuration || "0", 10);
    
    const call = await Call.findOne({ twilioCallId: CallSid });
    if (!call) {
      return res.status(200).json({ message: "Call log record not found (Status Callback)" });
    }

    call.status = twilioStatus || 'failed'; 
    
    if (call.status === 'completed') {
      let finalCost = durationSeconds * PricePerSecond;
      finalCost = Math.round(finalCost * 10000) / 10000;

      call.duration = durationSeconds;
      call.TotalCost = finalCost;

      await User.findByIdAndUpdate(userId, { 
        $inc: { balance: -finalCost } 
      });
    } else {
      call.duration = 0;
      call.TotalCost = 0;
    }

    await call.save();
    return res.status(200).json({ message: "Call billing updated successfully" });
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
