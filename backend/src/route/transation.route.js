import express from "express";
import { verifyJWT } from "../middleWare/jwtAuth.js";
import {
  deleteMultiTransations,
  getTransations,
} from "../controller/transations.controller.js";

const router = express.Router();

router.get("/", verifyJWT, getTransations);
router.delete("/", verifyJWT, deleteMultiTransations);

export default router;
