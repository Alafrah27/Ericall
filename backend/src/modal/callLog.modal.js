import mongoose from "mongoose";

const callLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
    },
    duration: Number,
    totalCost: Number,
  },
  { timestamps: true },
);

const CallLog = mongoose.model("CallLog", callLogSchema);
export default CallLog;
