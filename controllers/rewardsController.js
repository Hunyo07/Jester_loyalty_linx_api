import UserReward from "../models/userRewards.js";

const addRewardPoint = async (req, res) => {
  try {
    const { userId } = req.user;
    const { rewardPoints, expiredOn } = req.body;

    if (!rewardPoints || !expiredOn) {
      throw new Error("This fields are required");
    }
    const newReward = new UserReward({
      userId,
      rewardPoints,
      expiredOn,
    });

    const saveRewardPoint = await newReward.save();
    res.status(200).send({
      message: "Rewards point successfully added!",
      rewards: saveRewardPoint,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getAllRewardPoint = async (req, res) => {
  try {
    const { userId } = req.user;

    console.log(userId);

    const rewards = await UserReward.find({ userId });

    res.status(200).send({ rewards: rewards });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export { addRewardPoint, getAllRewardPoint };
