import { Router } from "express";
import { protect } from "../middlewares/protect.js";
import * as upload from "../controllers/uploadController.js";

const router = Router();

router.post("/profile-picture", protect, upload.uploadProfilePicture);
router.post("/valid-id", protect, upload.uploadValidId);
router.post("/selfie", protect, upload.uploadSelfie);

export default router;
