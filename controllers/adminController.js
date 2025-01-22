import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Merchant from "../models/merchant.js";
import Admin from "../models/admin.js";
import { hash, compare } from "bcrypt";
import { adminRole } from "../constants/globalConst.js";

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
      adminId: admin._id,
    });
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
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      throw new Error("This fields are required");
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
    });

    await newAdmin.save();

    res.status(200).send({ message: "Account successfully created!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export { verifyUserAccount, adminLogin, getAllUserAccount, createAccount };
