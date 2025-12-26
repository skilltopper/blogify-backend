import express from "express";
import {
  createUser,
  getUserDetails,
  refreshToken,
  getAllUsers,
  resetPassword,
  forgetPassword,
  toggleBlockUser,
  loginUser,
  logoutUser,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/userMulter.middleware.js";
import asyncHandler from "../middleware/asyncHandler.middleware.js";
import {
  createUserValidation,
  loginUserValidation,
  resetPasswordValidation,
  validate,
} from "../middleware/validtor.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";
import adminCheck from "../middleware/adminCheck.middleware.js";

const router = express.Router();

const imageFields = [
  { name: "profile", maxCount: 1 },
  { name: "banner", maxCount: 1 },
];

// User Routes
router.post(
  "/create",
  upload.fields(imageFields), // ✅ FIRST multer
  createUserValidation, // ✅ then validation
  validate,
  asyncHandler(createUser)
);

router
  .route("/login")
  .post(loginUserValidation, validate, asyncHandler(loginUser));

router.route("/logout").post(authMiddleware, asyncHandler(logoutUser));

router.route("/forgot-password").post(asyncHandler(forgetPassword));

router
  .route("/reset-password")
  .post(resetPasswordValidation, validate, asyncHandler(resetPassword));

router.route("/user-details").get(authMiddleware, asyncHandler(getUserDetails));

router
  .route("/all-users")
  .get(authMiddleware, adminCheck, asyncHandler(getAllUsers));

router
  .route("/toggle-block/:userId")
  .patch(authMiddleware, adminCheck, asyncHandler(toggleBlockUser));

router.route("/refresh-token").get(asyncHandler(refreshToken));

export default router;
