import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  userName: { type: String },
  userEmail: { type: String },
  userMobileNo: { type: String },
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Merchant",
  },
  merchantLogo: {
    type: String,
  },
  transactionType: {
    type: String,
    enum: ["redeem", "credit_applied", "refund", "points add", "substract"],
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
