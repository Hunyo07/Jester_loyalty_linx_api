import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/duhaupnxy/image/upload/v1712134056/samples/balloons.jpg",
    },
    isActive: { type: Boolean, default: true },
    role: { type: String, required: true, default: "user" },
    firstName: { type: String, required: true },
    middleName: { type: String, default: null },
    lastName: { type: String, required: true },
    mobileNo: { type: String, required: true, unique: true },
    birthdate: { type: Date },
    gender: { type: String, default: "" },
    fullAddress: {
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      province: { type: String, default: "" },
      country: { type: String, default: "Philippines" },
      postalCode: { type: String, default: "" },
    },
    verification: {
      isVerified: { type: Boolean, required: true, default: false },
      verificationCode: { type: String },
      verifiedAt: { type: Date },
      note: { type: String },
      validId: {
        type: String,
        default: "",
      },
      selfiePicture: {
        type: String,
        default: "",
      },
      status: { type: String, required: true, default: "new" },
      validatedBy: { type: String },
    },

    qrCode: { type: String },
    secretCode: { type: String, required: true },
    isFirstTimeLogin: { type: Boolean, default: true },
    limit: { type: String, required: true, default: "10000" },
    balance: { type: Number, default: 0 },
    pointsBalance: { type: Number, default: 0 },
    creditsBalance: { type: Number, default: 0 },
    creditRequests: [
      {
        creditRequestNumber: { type: String },
        merchantId: { type: String, required: true },
        merchantName: { type: String, required: true },
        merchantLogo: { type: String, required: true },
        isApproved: { type: Boolean, required: true, default: false },
        incomeSource: { type: String },
        incomeSourceAmount: { type: String },
        creditAmount: { type: Number, required: true, default: 0 },
        applicationDate: { type: Date, required: true, default: null },
        monthlyInstallment: { type: String },
        term: { type: String },
        status: { type: String, required: true, default: "new" },
        dateApproved: { type: Date },
        paymentLog: [
          {
            paymentDate: { type: Date },
            paymentAmount: { type: Number },
            status: { type: String },
          },
        ],
      },
    ],
    cart: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        merchantId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        weight: {
          type: Number, // Product weight
          required: true,
        },
        description: {
          type: String,
        },
        image: {
          type: String, // Cloudinary image URL
          required: true,
        },
        categoryId: {
          type: mongoose.Schema.Types.ObjectId, // Reference to Category model
          ref: "Category",
          required: true,
        },
        inStock: {
          type: Boolean,
          default: true,
        },
        location: {
          type: String, // Product location
        },
        quantity: {
          type: Number,
          required: true,
          default: 0,
        },
        addedDate: {
          type: Date,
          default: Date.now, // Automatically sets the creation date
        },
      },
    ],
    transactionHistory: [],
    orders: [],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
