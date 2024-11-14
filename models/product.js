import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    merchant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant", // Correct model name
      required: true,
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
    available: {
      type: Boolean,
      default: true, // Used to temporarily disable an item even if it has stock
    },
    location: {
      type: String, // Product location
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically sets the creation date
    },
  },
  {
    timestamps: true, // Add this option
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
