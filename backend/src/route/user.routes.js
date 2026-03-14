import express from "express";
const router = express.Router();

import {
  RegisterUserWithPhone,
  verifyOtp,
  resendOtp,
  getMyProfile,
} from "../controller/user.controller.js";
import { verifyJWT } from "../middleWare/jwtAuth.js";

router.post("/register", RegisterUserWithPhone);
router.post("/verify", verifyOtp);
router.post("/resendOtp", resendOtp);
router.post("/me", verifyJWT, getMyProfile);

export default router;
