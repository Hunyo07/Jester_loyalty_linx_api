import mongoose from "mongoose";

const userRewardSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    rewardPoints: { type: Number, default: 0 },
    expiredOn: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

const UserReward = mongoose.model(
  "UserReward",
  userRewardSchema,
  "user_rewards"
);

export default UserReward;
