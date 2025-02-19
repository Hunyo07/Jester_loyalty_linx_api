import * as admin from "../controllers/adminController.js";
import { Router } from "express";
import {
  protect,
  protectByRole,
  adminProtect,
} from "../middlewares/protect.js";
import { adminRole } from "../constants/globalConst.js";

const router = Router();

router.patch(
  "/verify-user-account/:id",
  adminProtect,
  protectByRole(adminRole),
  admin.verifyUserAccount
);

router.post("/login", protectByRole(adminRole), admin.adminLogin);
router.post("/register", admin.createAccount);

router.post(
  "/get-all-user",
  adminProtect,
  protectByRole(adminRole),
  admin.getAllUserAccount
);

// Merchant staff management routes
router.post(
  "/merchant-staff",
  adminProtect,
  protectByRole(adminRole),
  admin.addMerchantStaff
);
router.put(
  "/merchant-staff/:staffId",
  adminProtect,
  protectByRole(adminRole),
  admin.updateMerchantStaff
);

// Credit management routes
router.put(
  "/credit-request/:requestId",
  adminProtect,
  protectByRole(adminRole),
  admin.handleCreditRequest
);

// Transaction management routes
router.get(
  "/transactions",
  adminProtect,
  protectByRole(adminRole),
  admin.getCustomerTransactions
);

router.get(
  "/borrowers/:merchantId",
  adminProtect,
  admin.getBorrowersByMerchant
);

router.get(
  "/analytics",
  adminProtect,
  protectByRole(adminRole),
  admin.getMerchantAnalytics
);

// Product management routes
router.post(
  "/products",
  adminProtect,
  protectByRole(adminRole),
  admin.manageMerchantProduct
);
router.put(
  "/products/:productId",
  adminProtect,
  protectByRole(adminRole),
  admin.manageMerchantProduct
);

export default router;
