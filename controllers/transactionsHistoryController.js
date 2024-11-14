import Transaction from "../models/transactions..js";
import User from "../models/user.js";

const getTransactionsByUserId = async (req, res) => {
  const { userId } = req.user;
  console.log();
  try {
    const transactions = await Transaction.find({ userId: userId.toString() });
    // const transactions = await Transaction.findOne({
    //   user_id: userId.toString(),
    // }).populate("userId");
    res.status(200).send({ transactions: transactions });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export { getTransactionsByUserId };
