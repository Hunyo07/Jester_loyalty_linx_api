import User from "../models/user.js";
import Merchant from "../models/merchant.js";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { cloudinary } from "../config/cloudinary.js";
import crypto from "crypto";
import * as upload from "../controllers/uploadController.js";
import axios from "axios";
import * as dotenv from "dotenv";
import Transaction from "../models/transactions..js";
dotenv.config();

const sendVerificationCode = async (phoneNumber, secretCode) => {
  const response = await axios.post(
    "https://api.semaphore.co/api/v4/messages",
    {
      apikey: process.env.SEMAPHORE_API_KEY,
      number: phoneNumber,
      message: "Your Loyaltylinx verification code is: " + secretCode,
    }
  );
  const result = response.data;
  return "SMS sent successfully";
  // res.status(200).json({ message: "SMS sent successfully", data: result });
};

function generateUniqueCode() {
  let code = "";

  while (code.length < 6) {
    const randomDigit = crypto.randomInt(0, 10); // Generate a random number between 0 and 9
    if (!code.includes(randomDigit.toString())) {
      code += randomDigit;
    }
  }

  return code;
}

function generateQrCode() {
  let code = "";

  while (code.length < 8) {
    const randomDigit = crypto.randomInt(0, 10); // Generate a random number between 0 and 9
    if (!code.includes(randomDigit.toString())) {
      code += randomDigit;
    }
  }

  return code;
}

const createUser = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      middleName,
      lastName,
      mobileNo,
      role,
      isFirstTimeLogin,
    } = req.body;
    if (!email || !password || !firstName || !lastName || !mobileNo) {
      throw new Error("This fields are required");
    }
    const existingEmail = await User.findOne({ email });
    const existingMobile = await User.findOne({ mobileNo });

    if (existingEmail) {
      throw new Error("Email already exist");
    }

    if (existingMobile) {
      throw new Error("Mobile number already exist");
    }

    const hashedPassword = await hash(password, 10);
    const newUser = new User({
      email,
      firstName,
      middleName,
      lastName,
      password: hashedPassword,
      mobileNo,
      role,
      isFirstTimeLogin,
      // qrCode: generateQrCode(),
      secretCode: generateUniqueCode(),
      verification: {
        isVerified: false,
        verificationCode: generateUniqueCode(),
        // verificationCodeExpires: new Date(),
      },
    });

    const generatedQr = generateQrCode();
    await newUser.save();
    const user = await User.findById(newUser._id);
    user.qrCode = user._id + generatedQr;
    user.save();

    res.status(200).send({ message: "Account successfully created!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const validateRegistration = async (req, res) => {
  try {
    const { mobileNo, email } = req.body;

    if (!email || !mobileNo) {
      throw new Error("This fields are required");
    }

    const existingMobileNo = await User.findOne({ mobileNo });
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      throw new Error("Email already exist");
    }

    if (existingMobileNo) {
      throw new Error("Mobile number already exist");
    }

    res.status(200).send({ message: "Eligible for registration" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    if (userId.toString() !== id) {
      throw new Error("You are not authorized to update your account!");
    }

    let profileUrl = "";

    if (req.file) {
      // check if profile picture is provided
      const image = await cloudinary.uploader.upload(req.file.path);

      profileUrl = image.secure_url; // get the secure url of the uploaded image
    }

    const { profilePic, ...others } = req.body;
    const updatedFields = { ...others };

    if (profileUrl) {
      // add the profile image to the update files
      updatedFields.profilePicture = profileUrl;
    }

    // update the user in the database
    const updatedUser = await User.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    res.status(200).send({ user: updatedUser });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (userId.toString() !== id) {
      throw new Error("You are not authorized to update your account!");
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found!");
    }

    const isMatch = await compare(currentPassword, user.password);

    if (!isMatch) {
      throw new Error("Password doesn't match");
    }

    const hashedPassword = await hash(newPassword, 10);

    user.password = hashedPassword;
    user.save();

    return res.status(200).send({ message: "Password successfully updated!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { newPasscode, confirmPasscode } = req.body;
    const user = await User.findById(req.body.id);

    if (!user) {
      throw new Error("User not found!");
    }

    if (newPasscode !== confirmPasscode) {
      throw new Error("Confirm password doesn't match");
    }

    const hashedPassword = await hash(newPasscode, 10);
    user.password = hashedPassword;
    user.save();

    return res.status(200).send({ message: "Password successfully updated!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getAllUser = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send({ users: users });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);

    res.status(200).send({ userProfile: user });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Email doesn't match in our records");
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      throw new Error("Password is not correct");
    }

    if (!user.isFirstTimeLogin) {
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      res.status(200).send({
        token,
        userId: user._id,
        isFirstTimeLogin: user.isFirstTimeLogin,
      });
    } else {
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      sendVerificationCode(user.mobileNo, user.secretCode);
      res.status(200).send({
        token,
        userId: user._id,
        isFirstTimeLogin: user.isFirstTimeLogin,
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const loginUserMobileNo = async (req, res) => {
  try {
    const { mobileNo } = req.body;
    const user = await User.findOne({ mobileNo });

    if (!user) {
      throw new Error("Mobile No doesn't match in our records");
    }

    // const isMatch = await compare(password, user.password);
    // if (!isMatch) {
    //   throw new Error("Password is not correct");
    // }

    // if (user) {
    // const token = jwt.sign(
    //   {
    //     userId: user._id,
    //     mobileNo: user.mobileNo,
    //   },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "30d" }
    // );

    sendVerificationCode(user.mobileNo, user.secretCode);
    res.status(200).send({
      // token,
      userId: user._id,
      // isFirstTimeLogin: user.isFirstTimeLogin,
    });
    // }
    // else {
    //   const token = jwt.sign(
    //     {
    //       userId: user._id,
    //       mobileNo: user.mobileNo,
    //     },
    //     process.env.JWT_SECRET,
    //     { expiresIn: "30d" }
    //   );

    //   sendVerificationCode(user.mobileNo, user.secretCode);
    //   res.status(200).send({
    //     token,
    //     userId: user._id,
    //     isFirstTimeLogin: user.isFirstTimeLogin,
    //   });
    // }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const loginPassCode = async (req, res) => {
  try {
    const { password } = req.body;
    const { userId } = req.user;
    const user = await User.findById(userId);

    // if (!user) {
    //   throw new Error("Mobile No doesn't match in our records");
    // }
    if (!user) {
      throw new Error("User not found!");
    }
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      throw new Error("Passcode is not correct");
    }

    // const token = jwt.sign(
    //   {
    //     userId: user._id,
    //     mobileNo: user.mobileNo,
    //   },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "30d" }
    // );

    // sendVerificationCode(user.mobileNo, user.secretCode);
    res.status(200).send({
      message: "Successfully link in",
    });

    // else {
    //   const token = jwt.sign(
    //     {
    //       userId: user._id,
    //       mobileNo: user.mobileNo,
    //     },
    //     process.env.JWT_SECRET,
    //     { expiresIn: "30d" }
    //   );

    //   sendVerificationCode(user.mobileNo, user.secretCode);
    //   res.status(200).send({
    //     token,
    //     userId: user._id,
    //     isFirstTimeLogin: user.isFirstTimeLogin,
    //   });
    // }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const validateCodeFirstTimeLogin = async (req, res) => {
  try {
    const { secretCode } = req.body;
    const { userId } = req.user;
    const user = await User.findById(userId);

    if (secretCode !== user.secretCode) {
      return res.status(400).send({ message: "Invalid secret code" });
    }

    // user.isFirstTimeLogin = false;
    user.save();
    res.status(200).send({ message: "Valid secret code" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const validateCodeLogin = async (req, res) => {
  try {
    const { secretCode, userId } = req.body;
    // const { userId } = req.user;

    const user = await User.findById(userId);

    if (secretCode !== user.secretCode) {
      return res.status(400).send({ message: "Invalid secret code" });
    }

    // user.isFirstTimeLogin = false;
    user.save();

    if (secretCode === user.secretCode) {
      const token = jwt.sign(
        {
          userId: user._id,
          secretCode: user.secretCode,
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      res.status(200).send({
        token,
        // isFirstTimeLogin: user.isFirstTimeLogin,
        message: "Valid secret code",
      });
    }

    // res.status(200).send({ message: "Valid secret code" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

async function validateCode(req, res) {
  try {
    const { secretCode, userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    if (secretCode !== user.secretCode) {
      return res.status(400).send({ message: "Invalid secret code" });
    }

    res.status(200).send({ message: "Valid code" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

async function validateCodeWithToken(req, res) {
  try {
    const { secretCode } = req.body;
    const { userId } = req.user;
    const user = await User.findById(userId);

    if (secretCode !== user.secretCode) {
      return res.status(400).send({ message: "Invalid secret code" });
    }

    res.status(200).send({ message: "Valid token" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

const accountVerification = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);

    const {
      birthdate,
      gender,
      address,
      city,
      province,
      country,
      postalCode,
      validId,
      selfiePicture,
    } = req.body;

    if (
      !birthdate ||
      !gender ||
      !address ||
      !city ||
      !province ||
      !country ||
      !postalCode ||
      !validId ||
      !selfiePicture
    ) {
      throw new Error("This fields are required");
    }

    const newUser = {
      birthdate: birthdate,
      gender: gender,
      fullAddress: {
        address: address,
        city: city,
        province: province,
        country: country,
        postalCode: postalCode,
      },
      verification: {
        validId: validId,
        selfiePicture: selfiePicture,
        status: "pending",
      },
    };

    user.set(newUser);
    await user.save();

    res
      .status(200)
      .send({ message: "We're verifying your account!", user: user });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const accountVerificationAdded = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);

    const {
      birthdate,
      gender,
      address,
      city,
      province,
      country,
      postalCode,
      validId,
      selfiePicture,
      incomeSoure,
      monthlySalary,
    } = req.body;

    if (
      !birthdate ||
      !gender ||
      !address ||
      !city ||
      !province ||
      !country ||
      !postalCode ||
      !validId ||
      !incomeSoure ||
      !monthlySalary ||
      !selfiePicture
    ) {
      throw new Error("This fields are required");
    }

    const newUser = {
      birthdate: birthdate,
      gender: gender,
      fullAddress: {
        address: address,
        city: city,
        province: province,
        country: country,
        postalCode: postalCode,
      },
      verification: {
        validId: validId,
        selfiePicture: selfiePicture,
        status: "pending",
      },
      incomeSoure: incomeSoure,
      monthlySalary: monthlySalary,
    };

    user.set(newUser);
    await user.save();

    res
      .status(200)
      .send({ message: "We're verifying your account!", user: user });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const findUserAccount = async (req, res) => {
  try {
    const { email, mobileNo } = req.body;

    const user = await User.findOne({
      $or: [{ email }, { mobileNo }],
    });

    if (!user) {
      throw new Error("Your email/mobile no. doesn't match in our records");
    }
    if (user) {
      sendVerificationCode(user.mobileNo, user.secretCode);
    }

    res.status(200).send({ secretCode: user.secretCode, userId: user._id });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    upload.uploadProfilePicture(req.body.image, res);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// const refreshSecretCode = async (req, res) => {
//   try {
//     const { userId } = req.user;
//     const user = await User.findById(userId);
//     if (!user) {
//       throw new Error("User not found!");
//     }

//     user.secretCode = generateUniqueCode();
//     user.save();
//     res.status(200).send({
//       message: "Secret code successfully changed!",
//       secretCode: user.secretCode,
//     });
//   } catch (error) {
//     res.status(500).send({ message: error.message });
//   }
// };

const refreshSecretCode = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found!");
    }

    user.secretCode = generateUniqueCode();
    user.save();
    res.status(200).send({
      message: "Secret code successfully changed!",
      secretCode: user.secretCode,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

function generateCreditRequestNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const millisecond = date.getMilliseconds();

  const creditRequestNumber = `CR${year}${month}${day}${hour}${minute}${second}${millisecond}`;

  return creditRequestNumber;
}

const creditRequest = async (req, res) => {
  try {
    const { id } = req.params; //merchant's id
    const { userId } = req.user; //current user id
    const {
      incomeSource,
      incomeSourceAmount,
      creditAmount,
      term,
      monthlyInstallment,
      dateApproved,
    } = req.body;

    // check if the recepient exist
    const merchant = await Merchant.findById(id);
    const currentUser = await User.findOne(userId);

    if (!merchant) {
      throw new Error("Merchant not found!");
    }

    const existingPendingRequest = merchant.borrowerRequests.find(
      (request) =>
        request.userId === userId.toString() && request.status === "pending"
    );

    if (existingPendingRequest) {
      throw new Error("You have a pending credit application");
    }
    const creditRequestNumber = generateCreditRequestNumber();

    merchant.borrowerRequests.push({
      creditRequestNumber: creditRequestNumber,
      userId: currentUser._id,
      userName: currentUser.firstName,
      isApproved: false,
      incomeSource: incomeSource,
      incomeSourceAmount: incomeSourceAmount,
      creditAmount: creditAmount,
      applicationDate: new Date(),
      monthlyInstallment: monthlyInstallment,
      term: term,
      status: "pending",
      dateApproved: dateApproved,
    });

    currentUser.creditRequests.push({
      creditRequestNumber: creditRequestNumber,
      merchantId: merchant._id,
      merchantName: merchant.storeName,
      merchantLogo: merchant.profilePicture,
      isApproved: false,
      incomeSource: incomeSource,
      incomeSourceAmount: incomeSourceAmount,
      creditAmount: creditAmount,
      applicationDate: new Date(),
      monthlyInstallment: monthlyInstallment,
      term: term,
      status: "pending",
      dateApproved: dateApproved,
    });

    await merchant.save();
    await currentUser.save();
    res.status(200).send({ message: "Request sent" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const saveProfilePicturePath = async (req, res) => {
  try {
    const { userId } = req.user;
    const { imagePath } = req.body;
    const user = await User.findById(userId);

    if (!imagePath) {
      return res.status(400).send({ message: "Image path is required" });
    }

    user.profilePicture = imagePath;
    user.save();
    res.status(200).send({ path: user.profilePicture });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const refreshQrCode = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found!");
    }

    const generatedQr = generateQrCode();
    user.qrCode = userId + generatedQr;
    user.save();

    res.status(200).send({
      message: "QR code successfully changed!",
      qrCode: user.qrCode,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const sendOTP = async (req, res) => {
  try {
    const { number } = req.body;
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found!");
    }

    const response = await axios.post(
      "https://api.semaphore.co/api/v4/messages",
      {
        apikey: process.env.SEMAPHORE_API_KEY,
        number: number,
        message: "Your Loyaltylinx verification code is: " + user.secretCode,
      }
    );
    const result = response.data;
    res.status(200).json({ message: "SMS sent successfully", data: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const addTransaction = async (req, res) => {
  try {
    const { userId } = req.user;
    const { merchantId } = req.params;
    const { transactionType, amount, description } = req.body;

    const user = await User.findById(userId);
    const merchant = await Merchant.findById(merchantId);

    if (!user) {
      throw new Error("User not found!");
    }

    if (!merchant) {
      throw new Error("Merchant not found!");
    }
    const userName = user.firstName + " " + user.lastName;
    const userEmail = user.email;
    const userMobileNo = user.mobileNo;
    const merchantLogo = merchant.profilePicture;

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

    await transaction.save();

    user.transactionHistory.push(transaction);

    await user.save();

    res.status(200).send({ message: "Transaction added successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export {
  createUser,
  validateRegistration,
  loginUser,
  loginUserMobileNo,
  updateUser,
  updateUserPassword,
  getAllUser,
  getUserProfile,
  validateCodeFirstTimeLogin,
  validateCodeWithToken,
  validateCode,
  changePassword,
  accountVerification,
  uploadProfilePicture,
  findUserAccount,
  refreshSecretCode,
  creditRequest,
  saveProfilePicturePath,
  refreshQrCode,
  sendOTP,
  loginPassCode,
  validateCodeLogin,
  accountVerificationAdded,
  addTransaction,
};
