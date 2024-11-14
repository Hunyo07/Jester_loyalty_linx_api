import * as log from "../controllers/logsController.js";
import { Router } from "express";
import { protect } from "../middlewares/protect.js";

const router = Router();

router.post("/authentication", protect, log.authenticationLogs);

export default router;
