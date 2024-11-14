import mongoose from "mongoose";

const orderDetailSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Order model
      ref: "Order",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Product model
      ref: "Product",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields automatically
  }
);

const OrderDetail = mongoose.model("OrderDetail", orderDetailSchema);
export default OrderDetail;
