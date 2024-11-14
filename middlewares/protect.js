import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Admin from "../models/admin.js";
import Merchant from "../models/merchant.js";

const protect = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      throw new Error("Invalid token");
    }
    req.user = { userId: user._id };
    next();
  } catch (error) {
    res.status(401).send({ message: error.message });
  }
};

const adminProtect = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decodedToken.adminId);
    if (!admin) {
      throw new Error("Invalid token");
    }
    req.user = { adminId: admin._id };
    next();
  } catch (error) {
    res.status(401).send({ message: error.message });
  }
};

const merchantProtect = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const merchant = await Merchant.findById(decodedToken.merchantId);
    if (!merchant) {
      throw new Error("Invalid token");
    }
    req.user = { merchantId: merchant._id };
    next();
  } catch (error) {
    res.status(401).send({ message: error.message });
  }
};

const protectByRole = (role) => {
  return (req, res, next) => {
    try {
      const userRole = req.body.role;

      if (!role.includes(userRole)) {
        throw new Error("You are not authorized to perform this action");
      }
      next();
    } catch (error) {
      res.status(401).send({ message: error.message });
    }
  };
};

export { protect, protectByRole, adminProtect, merchantProtect };
