import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

// Use your centralized Twilio client or initialize a new one
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const targetNumber = "+291912345678"; // The external number you want to call
const twilioNumber = process.env.TWILIO_PHONE_NUMBER; // Your purchased Twilio number
const voiceUrl = "https://your-backend.com/voice"; // The URL with TwiML instructions

async function initiateDirectCall() {
  try {
    const call = await client.calls.create({
      to: targetNumber,
      from: twilioNumber,
      url: voiceUrl,
    });

    console.log("-----------------------------------------");
    console.log("✅ Call Successfully Created!");
    console.log(`📞 Target: ${targetNumber}`);
    console.log(`🆔 Call SID: ${call.sid}`);
    console.log(`📡 Status: ${call.status}`);
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("-----------------------------------------");
    console.error("❌ Failed to initiate call:");
    console.error(`Error Code: ${error.code || "N/A"}`);
    console.error(`Message: ${error.message}`);
    console.error("-----------------------------------------");
  }
}

initiateDirectCall();
