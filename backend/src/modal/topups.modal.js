import mongoose from "mongoose";

const topupSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentProvider: {
      type: String,
      default: "paypal",
    },
  },
  { timestamps: true },
);

const Topup = mongoose.model("Topup", topupSchema);
export default Topup;
