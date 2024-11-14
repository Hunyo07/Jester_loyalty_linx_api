import * as transactions from "../controllers/transactionsHistoryController.js";
import { protect } from "../middlewares/protect.js";
import { Router } from "express";

const router = Router();

router.get(
  "/get-user-transactions",
  protect,
  transactions.getTransactionsByUserId
);

export default router;
