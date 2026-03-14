import express from "express";
import {
  createPaymentWithPaypal,
  capturePaymentWithPaypal,
  paypalCancel,
  paypalSuccess,
} from "../controller/paypal.controller.js";
import { verifyJWT } from "../middleWare/jwtAuth.js";

const router = express.Router();

router.post("/create-payment", verifyJWT, createPaymentWithPaypal);
router.post("/capture-payment", verifyJWT, capturePaymentWithPaypal);
router.get("/cancel", verifyJWT, paypalCancel);
router.get("/success", verifyJWT, paypalSuccess);

export default router;
