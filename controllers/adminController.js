import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Merchant from "../models/merchant.js";
import Admin from "../models/admin.js";
import { hash, compare } from "bcrypt";
import { adminRole } from "../constants/globalConst.js";
import MerchantStaff from "../models/merchantStaff.js";
import UserCreditApp from "../models/userCreditApplication.js";
import Transaction from "../models/transactions..js";
import Product from "../models/product.js";

const verifyUserAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, note } = req.body;
    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found!");
    }
    if (!adminRole.includes(role)) {
      throw new Error("You are not authorized to perform this action");
    }

    const newData = {
      verification: {
        isVerified: true,
        verificationCode: user.verification.verificationCode,
        verifiedAt: new Date(),
        note: !note ? "" : note,
        validId: user.verification.validId,
        selfiePicture: user.verification.selfiePicture,
        status: "approved",
      },
    };

    user.set(newData);
    await user.save();

    res.status(200).send({
      message: `Verification request approved successfully!`,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      throw new Error("Email doesn't match in our records");
    }

    const isMatch = await compare(password, admin.password);
    if (!isMatch) {
      throw new Error("Password is not correct");
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).send({
      token,
      adminProfile: admin,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getBorrowersByMerchant = async (req, res) => {
  try {
    const { merchantId } = req.params;

    // Validate if merchant exists
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new Error("Merchant not found");
    }

    res.status(200).send({ borrowersRequest: merchant.borrowerRequests });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getAllUserAccount = async (req, res) => {
  try {
    const { role } = req.body;

    if (!adminRole.includes(role)) {
      throw new Error("You are not authorized to perform this action");
    }

    const users = await User.find();
    const filteredData = users.filter((user) => user.role === "user");

    res.status(200).send({ users: filteredData });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const createAccount = async (req, res) => {
  try {
    const { email, password, name, role, merchantId } = req.body;
    if (!email || !password || !name || !merchantId) {
      throw new Error("Email, password, name, and merchant ID are required");
    }

    // Check if merchant exists
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new Error("Merchant not found");
    }

    const existingMerchantEmail = await Merchant.findOne({ email });
    const existingUserEmail = await User.findOne({ email });
    const existingAdminEmail = await Admin.findOne({ email });

    if (existingMerchantEmail || existingUserEmail || existingAdminEmail) {
      throw new Error("Email already exist");
    }

    const hashedPassword = await hash(password, 10);
    const newAdmin = new Admin({
      email,
      name,
      password: hashedPassword,
      merchantId,
      role: role || "admin",
    });

    await newAdmin.save();

    res.status(201).send({ message: "Account successfully created!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Merchant Staff Management
const addMerchantStaff = async (req, res) => {
  try {
    const { name, email, password, role, merchantId } = req.body;

    const existingStaff = await MerchantStaff.findOne({ email });
    if (existingStaff) {
      throw new Error("Staff email already exists");
    }

    const hashedPassword = await hash(password, 10);
    const newStaff = new MerchantStaff({
      name,
      email,
      password: hashedPassword,
      role,
      merchantId,
    });

    await newStaff.save();
    res.status(201).send({ message: "Staff member added successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const updateMerchantStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const updates = req.body;

    const staff = await MerchantStaff.findById(staffId);
    if (!staff) {
      throw new Error("Staff member not found");
    }

    if (updates.password) {
      updates.password = await hash(updates.password, 10);
    }

    Object.keys(updates).forEach((key) => (staff[key] = updates[key]));
    await staff.save();

    res.status(200).send({ message: "Staff member updated successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Credit & Points Management
const handleCreditRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, note } = req.body;

    const creditRequest = await UserCreditApp.findById(requestId);
    if (!creditRequest) {
      throw new Error("Credit request not found");
    }

    creditRequest.status = status;
    if (status === "approved") {
      creditRequest.isApproved = true;
      creditRequest.approvedAt = new Date();
    }
    await creditRequest.save();

    res.status(200).send({ message: "Credit request processed successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Transaction Management
const getCustomerTransactions = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    const query = { userId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    res.status(200).send({ transactions });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Update the getMerchantAnalytics function to match your schema
const getMerchantAnalytics = async (req, res) => {
  try {
    const { merchantId, period } = req.query;
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "daily":
        startDate.setDate(startDate.getDate() - 1);
        break;
      case "weekly":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "monthly":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const transactions = await Transaction.find({
      merchantId,
      date: { $gte: startDate, $lte: endDate },
    });

    const analytics = {
      totalTransactions: transactions.length,
      totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
      transactionsByType: transactions.reduce((acc, t) => {
        acc[t.transactionType] = (acc[t.transactionType] || 0) + 1;
        return acc;
      }, {}),
    };

    res.status(200).send({ analytics });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Product Management
const manageMerchantProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const productData = req.body;

    if (productId) {
      // Update existing product
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }
      Object.keys(productData).forEach(
        (key) => (product[key] = productData[key])
      );
      await product.save();
    } else {
      // Add new product
      const newProduct = new Product(productData);
      await newProduct.save();
    }

    res.status(200).send({
      message: productId
        ? "Product updated successfully"
        : "Product added successfully",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export {
  verifyUserAccount,
  adminLogin,
  getAllUserAccount,
  createAccount,
  manageMerchantProduct,
  addMerchantStaff,
  updateMerchantStaff,
  handleCreditRequest,
  getCustomerTransactions,
  getMerchantAnalytics,
  getBorrowersByMerchant,
};
