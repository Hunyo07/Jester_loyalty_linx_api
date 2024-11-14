// controllers/cart.controller.js
import Cart from "../models/cart.js"; // Import your Cart model
import Product from "../models/product.js"; // Assuming you have a Product model
import User from "../models/user.js";
import Merchant from "../models/merchant.js";

// Add item to cart
const addItemToCart = async (req, res) => {
  try {
    const { userId } = req.user;
    const { productId, quantity } = req.body;
    const user = await User.findById(userId);
    let cart = await Cart.findOne({ user_id: userId });
    const product = await Product.findById(productId);
    const productName = product.name;
    // if (!cart) {
    //   return res.status(404).json({ message: "Cart not found" });
    // }

    // if (itemExist) {
    //   throw new Error("Item already in cart");
    // }

    if (!cart) {
      // If cart exists, check if item already exists
      cart = new Cart({
        user_id: userId,

        items: [{ productId, quantity, productName }],
      });

      user.cart.push({
        productId: product._id,
        merchantId: product.merchant_id,
        name: productName,
        price: product.price,
        quantity: quantity,
        weight: product.weight,
        description: product.description,
        image: product.image,
        categoryId: product.categoryId,
        inStock: product.inStock,
        location: product.location,
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        // If item exists, update the quantity
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Else, add the new item
        cart.items.push({ productId, quantity });
      }
      // If no cart, create a new one

      const itemIndexUser = user.cart.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndexUser > -1) {
        user.cart[itemIndexUser].quantity += quantity;
      } else {
        user.cart.push({
          productId: product._id,
          merchantId: product.merchant_id,
          name: productName,
          price: product.price,
          quantity: quantity,
          weight: product.weight,
          description: product.description,
          image: product.image,
          categoryId: product.categoryId,
          inStock: product.inStock,
          location: product.location,
        });
      }
      // const itemExist = cart.items.some(
      //   (cartItem) => cartItem.productId.toString() === productId
      // );

      // const quantityToUpdate = user.cart.find(
      //   (item) => item.productId.toString() === productId
      // );

      // const itemToUpdate = cart.items.find(
      //   (item) => item.productId.toString() === productId
      // );
    }
    // // const newProduct = {};

    await user.save();
    const savedCart = await cart.save();
    res.status(200).json(savedCart);
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Failed to add item to cart" });
  }
};

//Qunatity function in cart
const incrementDecrement = async (req, res) => {
  const { userId } = req.user;
  const { productId, action } = req.body;

  const cart = await Cart.findOne({ user_id: userId });
  const user = await User.findById(userId);

  try {
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const quantityToUpdate = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    const itemToUpdate = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (itemToUpdate) {
      if (action === "increase") {
        itemToUpdate.quantity += 1;
        quantityToUpdate.quantity += 1;
      } else if (action === "decrease") {
        if (itemToUpdate.quantity > 1) {
          itemToUpdate.quantity -= 1;
          quantityToUpdate.quantity -= 1;
        } else {
          return res
            .status(400)
            .json({ message: "Quantity cannot be less than 1" });
        }
      }
      await user.save();
      await cart.save();
      res.json({ message: "Item quantity update successfully" });
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Get cart by user
const getCartByUserId = async (req, res) => {
  const { userId } = req.user;
  const user = await User.findById(userId);
  const cart = await Cart.findOne({ user_id: userId }).populate(
    "items.productId"
  );
  try {
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json(user.cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

//delete item in cartnpm
const removeItemFromCart = async (req, res) => {
  const { userId } = req.user;
  const { productId } = req.body;
  const user = await User.findById(userId);

  try {
    let cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );

    const updatedCart = await cart.save();
    await user.save();
    res.status(200).json(updatedCart);
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Failed to remove item from cart" });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  const userId = req.user._id;

  try {
    await Cart.findOneAndDelete({ user_id: userId });
    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};

export {
  addItemToCart,
  removeItemFromCart,
  clearCart,
  getCartByUserId,
  incrementDecrement,
};
