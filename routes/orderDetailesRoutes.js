import { Router } from "express";
import * as OrderDetails from "../controllers/orderDetailsController.js";
import { protect } from "../middlewares/protect.js";
const router = Router();

router.post("/addOrderDetail", protect, OrderDetails.addOrderDetail);

router.get("/getOrderDetails", OrderDetails.getOrderDetails);

router.get("/getOrderDetails/:id", OrderDetails.getOrderDetailById);

router.delete("/delete/:id", OrderDetails.deleteOrderDetail);

export default router;
