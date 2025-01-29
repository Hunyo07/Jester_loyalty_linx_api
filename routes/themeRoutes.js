import { Router } from "express";
import * as theme from "../controllers/themeControllers.js";

const router = Router();

// Define routes
router.get("/themes", theme.getAllThemes);
router.get("/themes/:id", theme.getThemeById);
router.post("/create/themes", theme.createTheme);
router.put("/update/:id", theme.updateTheme);
router.delete("/delete/:id", theme.deleteTheme);
router.put("/set/active", theme.setActiveTheme);
router.get("/get/active", theme.getActiveTheme);

export default router;
