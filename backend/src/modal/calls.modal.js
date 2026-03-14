import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phoneNumber: {
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
      enum: [
        "ringing",
        "busy",
        "completed",
        "failed",
        "no-answer",
        "cancelled",
      ],
      default: "ringing",
    },
    twilioCallId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const Call = mongoose.model("Call", callSchema);
export default Call;
