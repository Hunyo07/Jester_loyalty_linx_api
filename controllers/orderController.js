import Order from "../models/order.js"; // Import your Order model
import OrderDetail from "../models/orderDetails.js";
import Cart from "../models/cart.js";
import User from "../models/user.js";
import Merchant from "../models/merchant.js";
import Transaction from "../models/transactions..js";

// Function to calculate points
function calculatePoints(amount, conversionRate) {
  if (typeof amount !== "number" || isNaN(amount) || amount < 0) {
    throw new Error("Invalid amount. Please provide a positive number.");
  }
  if (
    typeof conversionRate !== "number" ||
    isNaN(conversionRate) ||
    conversionRate <= 0
  ) {
    throw new Error(
      "Invalid conversion rate. Please provide a positive number."
    );
  }
  // Calculate precise points without rounding
  return parseFloat((amount / conversionRate).toFixed(2));
}

// function calculatePoints(amount) {
//   if (typeof amount !== "number" || isNaN(amount) || amount < 0) {
//     throw new Error("Invalid amount. Please provide a positive number.");
//   }

//   return Math.floor(amount / 100);
// }
// Function to calculate total price
function calculateTotal(items) {
  return items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

const addOrder = async (req, res) => {
  const {
    shippingAddress,
    orderAddress,
    orderEmail,
    paymentMethod,
    orderDetails,
  } = req.body;
  const { userId } = req.user;

  try {
    const user = await User.findById(userId);
    let cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const orderProductIds = orderDetails.map((item) => item.productId);
    const merchantId = orderDetails[0].merchantId;
    const merchant = await Merchant.findById(merchantId);
    const awardingAmount = merchant.awardingAmount;
    const grandPrice = calculateTotal(orderDetails);

    if (user.balance < grandPrice) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    user.cart = user.cart.filter(
      (item) => !orderProductIds.includes(item.productId.toString())
    );
    // Filter out cart items that do not match any product ID in orderProductIds
    cart.items = cart.items.filter(
      (item) => !orderProductIds.includes(item.productId.toString())
    );

    // Create a new order
    const newOrder = new Order({
      user_id: userId, // Use authenticated user's ID
      shippingAddress,
      orderAddress,
      orderEmail,
      paymentMethod,
      order_status: "pending",
    });

    const savedOrder = await newOrder.save();

    // Add order details if provided
    if (orderDetails && orderDetails.length > 0) {
      const orderDetailPromises = orderDetails.map(async (detail) => {
        const newOrderDetail = new OrderDetail({
          order_id: savedOrder._id,
          product_id: detail.productId,
          quantity: detail.quantity,
          price: detail.price,
        });
        const savedOrderDetail = await newOrderDetail.save();
        return savedOrderDetail._id; // Return the ID of the saved order detail
      });

      // Save all order details and update the order with their IDs
      const savedOrderDetailIds = await Promise.all(orderDetailPromises);

      savedOrder.orderDetails = savedOrderDetailIds;

      user.orders.push({
        order_status: "pending",
        payment_method: paymentMethod,
        order_date: new Date(),
        grand_price: calculateTotal(orderDetails),
        orderDetails,
      });

      if (paymentMethod == "credit_card") {
        user.pointsBalance += calculatePoints(grandPrice, awardingAmount);
        user.balance -= grandPrice;
      }

      const userName = user.firstName + " " + user.lastName;
      const userEmail = user.email;
      const userMobileNo = user.mobileNo;
      const merchantLogo = merchant.profilePicture;
      const amount = calculatePoints(grandPrice, awardingAmount);
      const description = "Purchase";
      const transactionType = "points add";
      const transactionTypeCredit = "substract";

      const transaction = new Transaction({
        userName: userName,
        userId: userId,
        userEmail: userEmail,
        transactionType: transactionType,
        userMobileNo: userMobileNo,
        merchantId: merchantId,
        amount: amount,
        merchantLogo: merchantLogo,
        description: description,
        dateTime: new Date(),
      });

      const transactionCredit = new Transaction({
        userName: userName,
        userId: userId,
        userEmail: userEmail,
        transactionType: transactionTypeCredit,
        userMobileNo: userMobileNo,
        merchantId: merchantId,
        amount: grandPrice,
        merchantLogo: merchantLogo,
        description: description,
        dateTime: new Date(),
      });

      console.log(transaction);
      console.log(transactionCredit);

      user.transactionHistory.push(transaction, transactionCredit);
      await transactionCredit.save();
      await transaction.save();
      await user.save();
      await savedOrder.save();
    }

    res.status(201).json({
      message: "Order successfully added",
      // order: savedOrder,
    });
  } catch (error) {
    console.error("Error adding order:", error);
    res.status(500).json({ message: "Failed to add order" });
  }
};

// Get all orders
const getAllOrders = async (req, res) => {
  const user_id = req.user._id; // Get authenticated user's ID

  try {
    const orders = await Order.find({ user_id }) // Get orders only for the authenticated user
      .populate("user_id", "email") // Populate user info
      .populate({
        path: "orderDetails", // Populate order details
        populate: { path: "product_id" }, // Nested populate for product info
      });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// Get a single order by ID
const getOrderById = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user._id; // Get authenticated user's ID

  try {
    const order = await Order.findOne({ _id: id, user_id }).populate(
      "user_id",
      "email"
    ); // Find order only if it belongs to the user

    if (!order) {
      return res.status(404).json({
        message:
          "Order not found or you don't have permission to access this order",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

// Update an order
const updateOrder = async (req, res) => {
  const { id } = req.params;
  const {
    shippingAddress,
    orderAddress,
    orderEmail,
    order_status,
    orderDetails,
  } = req.body;
  const user_id = req.user._id; // Get authenticated user's ID

  try {
    // Update order info if it belongs to the authenticated user
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id, user_id }, // Find order only if it belongs to the user
      { shippingAddress, orderAddress, orderEmail, order_status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message:
          "Order not found or you don't have permission to update this order",
      });
    }

    // Update order details
    if (orderDetails && orderDetails.length > 0) {
      // Delete old order details
      await OrderDetail.deleteMany({ order_id: updatedOrder._id });

      // Add new order details
      const orderDetailPromises = orderDetails.map((detail) => {
        const newOrderDetail = new OrderDetail({
          order_id: updatedOrder._id,
          product_id: detail.product_id,
          quantity: detail.quantity,
          price: detail.price,
        });
        return newOrderDetail.save();
      });
      await Promise.all(orderDetailPromises);
    }

    res.status(200).json({
      message: "Order successfully updated",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Failed to update order" });
  }
};

const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user._id; // Get authenticated user's ID

  try {
    // Delete order only if it belongs to the authenticated user
    const deletedOrder = await Order.findOneAndDelete({ _id: id, user_id });

    if (!deletedOrder) {
      return res.status(404).json({
        message:
          "Order not found or you don't have permission to delete this order",
      });
    }

    // Delete associated order details
    await OrderDetail.deleteMany({ order_id: deletedOrder._id });

    res.status(200).json({
      message: "Order and associated details successfully deleted",
      order: deletedOrder,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Failed to delete order" });
  }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
  const { id } = req.params; // Order ID
  const { order_status } = req.body;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.order_status = order_status;
    const updatedOrder = await order.save();

    res.status(200).json({
      message: "Order status updated",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

const createOrderFromCart = async (req, res) => {
  const userId = req.user._id; // Get the authenticated user's ID from the token
  const { shippingAddress } = req.body;

  try {
    // Fetch user's cart
    const cart = await Cart.findOne({ user_id: userId }).populate(
      "items.productId"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // Create new order from cart
    const newOrder = new Order({
      user_id: userId,
      items: cart.items, // Copy items from cart to order
      totalAmount: cart.items.reduce(
        (acc, item) => acc + item.productId.price * item.quantity,
        0
      ), // Assuming you have price in product schema
      shippingAddress,
      orderDate: Date.now(),
      order_status: "Pending", // Default status
    });

    // Save the order
    const savedOrder = await newOrder.save();

    // Clear the user's cart after order is placed
    await Cart.findOneAndDelete({ user_id: userId });

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error creating order from cart:", error);
    res.status(500).json({ message: "Failed to create order from cart" });
  }
};

export { addOrder, getAllOrders, getOrderById, updateOrder, deleteOrder };
