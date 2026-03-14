import express from "express";
const router = express.Router();

import {
  RegisterUserWithPhone,
  verifyOtp,
} from "../controller/user.controller.js";

router.post("/register", RegisterUserWithPhone);
router.post("/verify", verifyOtp);

export default router;
