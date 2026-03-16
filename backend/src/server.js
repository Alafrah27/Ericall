import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";

import connectDB from "./lib/connectDb.js";
import job from "./lib/cron.js";
const app = express();
import userRoutes from "./route/user.routes.js";
import paypalRoutes from "./route/paypal.route.js";
import transationRoutes from "./route/transation.route.js";
import callsRoutes from "./route/calls.route.js";

dotenv.config();
job.start();
const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "5mb" })); // Make sure json body is still supported
app.use(cookieParser());
app.use(cors("*"));
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/paypal", paypalRoutes);
app.use("/api/v1/transation", transationRoutes);
app.use("/api/v1/calls", callsRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
