import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.config.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_profile",
    allowed_formats: ["jpg", "png", "jpeg", "avif", "webp"],
  },
});

const upload = multer({ storage });

export { upload };
