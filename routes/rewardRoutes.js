import * as rewards from '../controllers/rewardsController.js';
import { Router } from 'express';
import { protect } from  "../middlewares/protect.js";

const router = Router();

// create post
router.post("/add-points", protect, rewards.addRewardPoint);
router.get("/get-all", protect, rewards.getAllRewardPoint);

export default router;