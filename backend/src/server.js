import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./lib/connectDb.js";
import job from "./lib/cron.js";

import userRoutes from "./route/user.routes.js";
import paypalRoutes from "./route/paypal.route.js";
import transationRoutes from "./route/transation.route.js";
dotenv.config();
job.start();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json({ limit: "5mb" })); // req.body
app.use(cookieParser());
app.use(cors("*"));

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/paypal", paypalRoutes);
app.use("/api/v1/transation", transationRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
