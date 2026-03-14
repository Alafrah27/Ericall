import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";


import userRoutes from "./route/user.routes.js";
import connectDB from "./lib/connectdb.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json({ limit: "5mb" })); // req.body
app.use(cookieParser());
app.use(cors("*"));

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use("/api/v1/auth", userRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
