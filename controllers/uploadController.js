import { cloudinary } from "../config/cloudinary.js";
import multer from "multer";

const storage = multer.memoryStorage();
const uploader = multer({
  storage: storage,
  limits: { fileSize: 70000 }, // Limit file size to 70KB
}).single("image");

// upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    uploader(req, res, (err) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "File upload failed", error: err });
      }

      // Upload image to Cloudinary
      cloudinary.uploader
        .upload_stream(
          { resource_type: "auto", folder: "LoyaltyLinx/ProfilePicture" },
          (error, result) => {
            if (error || !result) {
              return res
                .status(500)
                .json({ message: "Cloudinary upload failed", error: error });
            }

            // Here, you can use the result variable to get the URL or any other details of the uploaded image
            res.status(200).json({
              message: "Image uploaded successfully",
              imageUrl: result.url,
            });
          }
        )
        .end(req.file.buffer);
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// upload valid id
const uploadValidId = async (req, res) => {
  try {
    uploader(req, res, (err) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "File upload failed", error: err });
      }

      // Upload image to Cloudinary
      cloudinary.uploader
        .upload_stream(
          { resource_type: "auto", folder: "LoyaltyLinx/validID" },
          (error, result) => {
            if (error || !result) {
              return res
                .status(500)
                .json({ message: "Cloudinary upload failed", error: error });
            }

            // Here, you can use the result variable to get the URL or any other details of the uploaded image
            res.status(200).json({
              message: "Image uploaded successfully",
              imageUrl: result.url,
            });
          }
        )
        .end(req.file.buffer);
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// upload selfie
const uploadSelfie = async (req, res) => {
  try {
    uploader(req, res, (err) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "File upload failed", error: err });
      }

      // Upload image to Cloudinary
      cloudinary.uploader
        .upload_stream(
          { resource_type: "auto", folder: "LoyaltyLinx/selfie" },
          (error, result) => {
            if (error || !result) {
              return res
                .status(500)
                .json({ message: "Cloudinary upload failed", error: error });
            }

            // Here, you can use the result variable to get the URL or any other details of the uploaded image
            res.status(200).json({
              message: "Image uploaded successfully",
              imageUrl: result.url,
            });
          }
        )
        .end(req.file.buffer);
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// const uploadSelfie = async (req, res) => {
//   try {
//     const result = await cloudinary.uploader.upload(req.body.image, {
//       folder: "LoyaltyLinx/selfie",
//     });

//     res.status(200).json({ imageUrl: result.url, apiKey: result });
//   } catch (error) {
//     res.status(500).send({ message: error.message });
//   }
// };

export { uploadProfilePicture, uploadValidId, uploadSelfie };
