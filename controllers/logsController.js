import Logs from "../models/logs.js";

const authenticationLogs = async (req, res) => {
  try {
    const { userId, description, platform, ipAddress } = req.body;
    if (!userId || !description || !platform || !ipAddress) {
      throw new Error("This fields are required");
    }

    const newLog = new Logs({
      userId,
      description,
      platform,
      ipAddress,
    });

    await newLog.save();
    res.status(200).send({ message: "Log successfully created!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export { authenticationLogs };
