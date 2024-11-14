import mongoose from "mongoose";

const logsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    description: { type: String, required: true },
    platform: { type: String, required: true },
    ipAddress: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Logs = mongoose.model("logs", logsSchema);

export default Logs;
