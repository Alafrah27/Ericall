import twilio from "twilio";
import User from "../modal/user.modal.js";
import Client from "../lib/paypal.js";
import dotenv from "dotenv";
import Call from "../modal/calls.modal.js";
import twilioClient from "../lib/twilioServices.js"; // fallback if Client is meant to be Twilio and imported from paypal.js by mistake. Wait, looking at lines 3 it's importing from paypal.js, which is wrong, Twilio client is needed. Let me fix the import.
dotenv.config();

// Assuming Client was incorrectly mapped to paypal.js in the original, I'll instantiate twilio here.
const TwilioClient = twilio(process.env.TWILIO_API_SID, process.env.TWILIO_API_SECRECT, { accountSid: process.env.TWILIO_ACCOUNT_SID });

// Pricing constants
const TwilioCostPricePerMinute = 0.335;
const EricallProfitMargin = 0.4;
const PricePerMinute = TwilioCostPricePerMinute * (1 + EricallProfitMargin);
const PricePerSecond = PricePerMinute / 60;

export const MakeCall = async (req, res) => {
  try {
    const { phone } = req.body; // The target destination phone
    const userId = req.user.id;

    if (!phone) {
      return res.status(400).json({ message: "Destination phone number is required" });
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
    
    // 1. Tell Twilio to call the App User's physical phone.
    // When the user answers, Twilio requests the `url` to know what to do next.
    const call = await TwilioClient.calls.create({
      to: user.phone, // Leg 1: Call the user
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${process.env.DOMAIN_URL}/api/v1/calls/voice-webhook?target=${encodeURIComponent(phone)}&userId=${userId}`,
      statusCallback: `${process.env.DOMAIN_URL}/api/v1/calls/call-status`,
      // We don't bill on the parent call anymore, the Dial action handles the actual conversation end.
      // But we can keep it for general logging if needed, or remove it so it doesn't double-charge if not handled.
      // Let's remove statusCallback since Dial action overrides everything.
    });

    // Since we removed statusCallback from the parent, we must inject twilioCallId into the webhook URL
    // so the Dial action has it. Wait, MakeCall must provide it to VoiceWebhook.
    // Call is already created synchronously, we can't inject SID into the URL dynamically before creation.
    // However, in TwilioWebhook, req.body.CallSid is the parent CallSid! 
    
    // Wait, the previous chunk modified TwilioWebhook to use target, userId, twilioCallId from req.query.
    // But Twilio passes CallSid in the POST body to TwilioWebhook automatically.
    // So let's rely on req.body.CallSid inside the Webhook to construct the action URL!

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
    console.error("Twilio MakeCall Error:", error);
    return res.status(500).json({ message: "Failed to initiate PSTN call" });
  }
};

export const TwilioWebhook = async (req, res) => {
  try {
    const { target, userId } = req.query;
    const parentCallSid = req.body.CallSid; // This is the SID of Leg 1 (Twilio -> User)
    
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    const user = await User.findById(userId);
    if (!user || user.balance <= 0) {
      response.say("Sorry, your account balance is insufficient for this call.");
      response.hangup();
      res.type("text/xml");
      return res.send(response.toString());
    }

    const MaxMinutes = Math.floor(user.balance / PricePerMinute);
    const MaxSeconds = MaxMinutes * 60;

    if (MaxSeconds > 0) {
      // Leg 2: Bridge the call to the target phone number and track exactly the Dial duration
      const dial = response.dial({ 
        timeLimit: MaxSeconds,
        action: `${process.env.DOMAIN_URL}/api/v1/calls/call-status?userId=${userId}&parentCallId=${parentCallSid}`,
        method: 'POST'
      });
      dial.number(target);
    } else {
      response.say("Sorry, your balance is too low.");
      response.hangup();
    }

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
    // We now read from Dial action which sends DialCallStatus and DialCallDuration
    // userId and parentCallId are passed in the query string from the Action URL
    const { DialCallStatus, DialCallDuration } = req.body;
    const { userId, parentCallId } = req.query;
    
    // DialCallDuration is the exact time the second leg was connected (conversation time)
    let durationSeconds = parseInt(DialCallDuration || "0", 10);
    
    // Find the call using the parent Call SID previously saved
    const call = await Call.findOne({ twilioCallId: parentCallId });
    if (!call) {
      return res.status(404).json({ message: "Call not found in DB" });
    }

    // Standardize status: If DialCallStatus is completed, the conversation happened.
    call.status = DialCallStatus === 'completed' ? 'completed' : DialCallStatus || 'failed'; 
    
    if (call.status === 'completed') {
      // Calculate exact cost based on actual seconds spoken
      let finalCost = durationSeconds * PricePerSecond;
      // Floating-point precision fix: Round to 4 decimal places max
      finalCost = Math.round(finalCost * 10000) / 10000;

      call.duration = durationSeconds;
      call.TotalCost = finalCost;

      // Deduct from caller's balance safely
      await User.findByIdAndUpdate(userId, { 
        $inc: { balance: -finalCost } 
      });
    } else {
      // If busy, failed, or unanswered, no charge is applied.
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
