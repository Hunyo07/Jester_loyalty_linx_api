import { Router } from "express";
import * as theme from "../controllers/themeControllers.js";

const router = Router();

// Define routes
router.get("/themes", theme.getAllThemes);
router.get("/themes/:id", theme.getThemeById);
router.post("/create/themes", theme.createTheme);
router.put("/themes/:id", theme.updateTheme);
router.delete("/themes/:id", theme.deleteTheme);

export default router;
