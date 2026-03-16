import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

export const validateTwilioRequest = (req, res, next) => {
  try {
    const twilioSignature = req.headers["x-twilio-signature"];
    const url = process.env.DOMAIN_URL + req.originalUrl;
    
    // Twilio POST requests pass parameters in the body.
    // Twilio GET requests pass them in the query string.
    const params = req.method === 'POST' ? req.body : {};

    const isValid = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      twilioSignature,
      url,
      params
    );

    if (isValid) {
      next();
    } else {
      console.error("Twilio Signature Validation Failed.");
      res.status(403).send("Forbidden: Invalid Twilio Signature.");
    }
  } catch (error) {
    console.error("Error validating Twilio request:", error);
    res.status(500).send("Internal Server Error.");
  }
};
