import mongoose from "mongoose";

const transationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      default: "credit",
    },
    amount: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      default: "topup",
    },
  },
  { timestamps: true },
);

const Transation = mongoose.model("Transation", transationSchema);
export default Transation;
