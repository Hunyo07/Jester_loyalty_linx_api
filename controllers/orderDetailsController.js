// Create a new OrderDetail
import OrderDetail from "../models/orderDetails.js";
import Order from "../models/order.js";
import User from "../models/user.js";

 const addOrderDetail = async (req, res) => {
  try {
    const { order_id, product_id, quantity, price } = req.body;
    const user_id = req.user._id; // Get authenticated user's ID

    // Verify the order belongs to the user
    const order = await Order.findOne({ _id: order_id, user_id });

    if (!order) {
      return res.status(403).json({
        message: "You are not authorized to add details to this order",
      });
    }

    const newOrderDetail = new OrderDetail({
      order_id,
      product_id,
      quantity,
      price,
    });

    const savedOrderDetail = await newOrderDetail.save();

    res.status(201).json({
      message: "Order detail added successfully",
      orderDetail: savedOrderDetail,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error adding order detail",
      error,
    });
  }
};

// Get all OrderDetails
 const getOrderDetails = async (req, res) => {
  try {
    const orderDetails = await OrderDetail.find().populate("orderId productId");
    res.status(200).json(orderDetails);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order details", error });
  }
};

// Get OrderDetail by ID
 const getOrderDetailById = async (req, res) => {
  try {
    const orderDetail = await OrderDetail.findById(req.params.id).populate(
      "orderId productId"
    );
    res.status(200).json(orderDetail);
  } catch (error) {
    res.status(404).json({ message: "Order detail not found", error });
  }
};

// Delete OrderDetail
 const deleteOrderDetail = async (req, res) => {
  try {
    await OrderDetail.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Order detail deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting order detail", error });
  }
};

export {
  addOrderDetail,
  getOrderDetails,
  getOrderDetailById,
  deleteOrderDetail,
};
