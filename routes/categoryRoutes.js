import * as category from "../controllers/categoryController.js";
import express from "express";

const router = express.Router();

//Category
router.post("/addCategory", category.addCategory);
router.get("/getAllCategories", category.getAllCategories);
router.get("/getCategoryById/:id", category.getCategoryById);

router.put("/updateCategory/:id", category.updateCategory);
router.delete("/deteteCategory/:id", category.deleteCategory);

export default router;
