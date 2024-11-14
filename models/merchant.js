import mongoose from "mongoose";

const merchantSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    mobileNo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/duhaupnxy/image/upload/v1712134056/samples/balloons.jpg",
    },
    awardingAmount: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
    role: { type: String, required: true, default: "merchant" },
    firstName: { type: String, required: true },
    middleName: { type: String, default: null },
    lastName: { type: String, required: true },
    storeName: { type: String, required: true },
    officeAddress: { type: String, required: true },
    shopAddress: { type: String, required: true },
    secretCode: { type: String, required: true },
    isFirstTimeLogin: { type: Boolean, default: true },
    creditPoints: { type: Number, default: 0 },
    borrowerRequests: [
      {
        creditRequestNumber: { type: String },
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        isApproved: { type: Boolean, required: true },
        incomeSource: { type: String },
        incomeSourceAmount: { type: String },
        creditAmount: { type: Number, required: true },
        monthlyInstallment: { type: String },
        term: { type: String },
        applicationDate: { type: Date, required: true },
        status: { type: String, required: true },
        dateApproved: { type: Date },
        limit: { type: String },
      },
    ],
    transactionHistory: [],
    orders: [],
  },
  {
    timestamps: true,
  }
);

const Merchant = mongoose.model("Merchant", merchantSchema);

export default Merchant;
