import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();
const Client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

export default Client;
