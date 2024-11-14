import * as user from "../controllers/userController.js";
import { Router } from "express";
import { protect, protectByRole } from "../middlewares/protect.js";
import { userRole } from "../constants/globalConst.js";
import * as cart from "../controllers/cartController.js";

const router = Router();

router.post("/register", user.createUser);
router.post("/login", protectByRole(userRole), user.loginUser);
router.post("/login/mobileNo", protectByRole(userRole), user.loginUserMobileNo);
// router.post("/first-login", protectByRole(userRole), user.firstLogin);
// router.put("/:id", protect, user.updateUser);
router.put("/update-password/:id", protect, user.updateUserPassword);
router.put("/change-password", user.changePassword);
router.get("/get-all", user.getAllUser);
router.get("/profile", protect, user.getUserProfile);
router.post("/validate-code-login", protect, user.validateCodeFirstTimeLogin);
router.post("/account-verification", protect, user.accountVerification);
router.post(
  "/account-verification/update",
  protect,
  user.accountVerificationAdded
);
router.post("/validate-code", user.validateCode);
router.post("/validate-code-with-token", protect, user.validateCodeWithToken);
router.post("/find-account", user.findUserAccount);
// router.post("/refresh-code", protect, user.refreshSecretCode);
router.post("/refresh-code", user.refreshSecretCode);
router.post("/refresh-qr", protect, user.refreshQrCode);
router.post("/upload-profile-picture", protect, user.saveProfilePicturePath);

router.post("/:id/request-credit", protect, user.creditRequest);
router.post("/validate/registration", user.validateRegistration);
router.post("/send-otp", protect, user.sendOTP);
router.post("/passcode", protect, user.loginPassCode);
router.post("/validate-login", user.validateCodeLogin);
router.post("/transactions/:merchantId", protect, user.addTransaction);
router.post("/add-to-cart", protect, cart.addItemToCart);
router.post("/delete-item-cart", protect, cart.removeItemFromCart);
router.post("/get-item-cart", protect, cart.getCartByUserId);
router.post("/quantity-item-cart", protect, cart.incrementDecrement);

export default router;
