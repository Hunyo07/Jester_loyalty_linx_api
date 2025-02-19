import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/duhaupnxy/image/upload/v1712134056/samples/balloons.jpg",
    },
    isActive: { type: Boolean, default: true },
    role: { type: String, required: true, default: "admin" },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
