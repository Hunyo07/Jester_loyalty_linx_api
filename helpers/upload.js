import { cloudinary } from "../config/cloudinary.js";

const uploadFile = async (filePath) => {
  try {
    const uploadedFileResult = await cloudinary.uploader.upload(filePath);
    return uploadedFileResult;
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

export { uploadFile };
