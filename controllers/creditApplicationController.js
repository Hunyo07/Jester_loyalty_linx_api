import userCreditApp from "../models/userCreditApplication.js";

const createUserCreditApplication = async (req, res) => {
  try {
    const {
      merchantId,
      merchantName,
      userId,
      userName,
      incomeSource,
      incomeSourceAmount,
      creditAmount,
      term,
      amortization,
    } = req.body;
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export { createUserCreditApplication };
