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
    let { phone } = req.body;
    const userId = req.user.id;

    if (!phone) return res.status(400).json({ message: "Phone is required" });

    // Ensure E.164 Format
    if (phone.startsWith("00")) {
      phone = "+" + phone.substring(2);
    } else if (!phone.startsWith("+")) {
      phone = "+" + phone;
    }

    const user = await User.findById(userId);
    if (!user || user.balance < PricePerMinute) {
      return res
        .status(400)
        .json({ message: "Insufficient balance for at least 1 minute" });
    }

    // Initiate the Outbound Call
    const call = await twilioClient.calls.create({
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER, // Must be +17712431648
      // Passing target number to the webhook so TwiML knows who to dial
      url: `${process.env.DOMAIN_URL}/api/v1/calls/voice-webhook?target=${encodeURIComponent(phone)}`,
      statusCallback: `${process.env.DOMAIN_URL}/api/v1/calls/call-status?userId=${userId}`,
      statusCallbackEvent: ["completed"],
    });

    const calling = new Call({
      userId,
      phoneNumber: phone,
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
  const targetNumber = req.query.target;
  const response = new twilio.twiml.VoiceResponse();

  if (targetNumber) {
    response.say("Connecting your Ericall.");
    // This connects the caller to the Eritrean number
    response.dial(targetNumber);
  } else {
    response.say("Error: No destination number provided.");
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
