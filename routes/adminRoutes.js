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

export default router;
