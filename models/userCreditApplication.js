import mongoose from "mongoose";

const userCreditAppllicationSchema = new mongoose.Schema(
  {
    merchantId: { type: String, required: true },
    merchantName: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    isApproved: { type: Boolean, required: true, default: false },
    incomeSource: { type: String, required: true },
    incomeSourceAmount: { type: String, required: true },
    monthlyInstallment: { type: String, required: true },
    creditAmount: { type: Number, required: true, default: 0 },
    approvedAt: { type: Date, required: true, default: null },
    term: { type: String, required: true },
    amortization: { type: String, required: true },
    status: { type: String, required: true, default: "pending" },
  },
  {
    timestamps: true,
  }
);

const userCreditApp = mongoose.model(
  "UserCreditApp",
  userCreditAppllicationSchema,
  "user_credit_application"
);

export default userCreditApp;
