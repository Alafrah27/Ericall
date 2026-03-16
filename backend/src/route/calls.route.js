import express from "express";
import {
  CallStatus,
  MakeCall,
  TwilioWebhook,
} from "../controller/TwilioPstnCall.js";
import { verifyJWT } from "../middleWare/jwtAuth.js";

import { validateTwilioRequest } from "../middleWare/TwilioMiddleware.js";

const router = express.Router();

router.post("/voice-webhook", validateTwilioRequest, TwilioWebhook);
router.post("/", verifyJWT, MakeCall);
router.post("/call-status", validateTwilioRequest, CallStatus);
export default router;
