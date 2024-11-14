import { Router } from "express";
import * as order from "../controllers/orderController.js";
import { protect } from "../middlewares/protect.js";

const router = Router();

router.post("/addOrder", protect, order.addOrder);

router.get("/", protect, order.getAllOrders);

router.get("/:id", protect, order.getOrderById);

router.put("/update/:id", protect, order.updateOrder);

router.delete("/delete/:id", protect, order.deleteOrder);

export default router;
