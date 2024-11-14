import express from "express";
import * as prod from "../controllers/productController.js";

const router = express.Router();

router.post("/addProduct", prod.addProduct);

router.get("/products", prod.getAllProduct);

router.get("/:id", prod.getAllProductID);

router.put("/update/:id", prod.updateProduct);

router.delete("/delete/:id", prod.deleteProduct);

export default router;
