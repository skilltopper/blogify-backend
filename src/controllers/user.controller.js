import transporter from "../config/nodemailer.config.js";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.utils.js";
import ApiResponse from "../utils/apiRespoce.utils.js";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.utils.js";

const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  const profileUrl = req.files?.profile?.[0]?.path || "";
  const bannerUrl = req.files?.banner?.[0]?.path || "";

  const userFound = await User.findOne({ email });

  if (userFound) {
    throw new ApiError(409, "User already exists with this email");
  }

  const newUser = new User({
    name,
    email,
    password,
    profile: profileUrl,
    banner: bannerUrl,
  });

  const refreshToken = generateRefreshToken(newUser._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  newUser.refreshToken = refreshToken;

  await newUser.save();

  const accessToken = generateAccessToken(newUser._id);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 60 * 1000, // 30 minutes
  });

      await transporter.sendMail({
    from: `"Blog App" <${process.env.SEMDER_EMAIL}>`,
    to: email,
    subject: "Welcome to Blog App",
    html: `
      <h1>Welcome to Blog App</h1>
      <p>Hi ${name},</p>
      <p>Thank you for registering at Blog App. We are excited to have you on board!</p>
      <p>Best regards,<br/>Blog App Team</p>
    `,
  });
  
  res.status(201).json(
    new ApiResponse(201, "User created successfully", {
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profile: newUser.profile,
        banner: newUser.banner,
        role: newUser.role,
      },
    })
  );

};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "invalid email or password");
  }

  const isPasswordMatch = await user.matchPassword(password);

  if (!isPasswordMatch) {
    throw new ApiError(404, "invalid email or password");
  }

  const refreshToken = generateRefreshToken(user._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  user.refreshToken = refreshToken;

  await user.save();

  const accessToken = generateAccessToken(user._id);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 60 * 1000, // 30 minutes
  });

      await transporter.sendMail({
    from: `"Blog App" <${process.env.SEMDER_EMAIL}>`,
    to: email,
    subject: "Login Notification",
    html: `
      <h1>Login Notification</h1>
      <p>Hi ${user.name},</p>
      <p>We noticed a login to your account. If this was you, you can safely ignore this email. If you did not log in, please reset your password immediately.</p>
      <p>Best regards,<br/>Blog App Team</p>
    `,
  });

  res.status(201).json(
    new ApiResponse(201, "User logged in successfully", {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        banner: user.banner,
        role: user.role,
      },
    })
  );

};

const logoutUser = async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  const findUser = await User.findById(user._id);

  findUser.refreshToken = "";

  await findUser.save();

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json(new ApiResponse(200, "User logged out successfully"));
};

const forgetPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new ApiError(404, "User not found with this email");
  }

  // Generate a reset OTP and its expiry time
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  await user.save();

  await transporter.sendMail({
    from: `"Blog App" <${process.env.SEMDER_EMAIL}>`,
    to: user.email,
    subject: "Password Reset OTP",
    html: `
      <h1>Password Reset OTP</h1>
      <p>Hi ${user.name},</p>
      <p>Your OTP for password reset is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
      <a href="${process.env.ORIGIN}/reset-password" style="background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Reset Password</a>
      <p>Best regards,<br/>Blog App Team</p>
    `,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "OTP sent to your email for password reset"));
};

const resetPassword = async (req, res) => {
  const { otp, email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found with this email");
  }

  if (user.otp !== otp || Date.now() > user.otpExpiry) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  user.password = password;
  user.otp = "";
  user.otpExpiry = "";

  await user.save();

  res.status(200).json(new ApiResponse(200, "Password reset successfully"));
};

const refreshToken = async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized: No refresh token provided");
  }

  let decoded = jwt.verify(
    incomingRefreshToken,
    process.env.JWT_REFRESH_SECRET
  );

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  // 🔒 Blocked user check
  if (user.isBlocked) {
    throw new ApiError(403, "Your account is blocked by admin");
  }

  // 🔐 Token mismatch protection
  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token mismatch");
  }

  const newAccessToken = generateAccessToken(user._id);

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 60 * 1000, // 30 minutes
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Access token refreshed successfully"));
};

const getUserDetails = async (req, res) => {
  const user = req.user;
  res
    .status(200)
    .json(new ApiResponse(200, "User details fetched successfully", user));
};

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: { $ne: "admin" } }).select(
    "_id name email role isBlocked profile createdAt"
  );

  if (!users.length) {
    throw new ApiError(404, "No users found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "All users fetched successfully", users));
};

const toggleBlockUser = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // ❌ Admin should not block himself
  if (req.user._id.toString() === user._id.toString()) {
    throw new ApiError(400, "Admin cannot block himself");
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, "User block status updated", {
      _id: user._id,
      isBlocked: user.isBlocked,
    })
  );
};

export {
  createUser,
  getAllUsers,
  loginUser,
  logoutUser,
  refreshToken,
  resetPassword,
  forgetPassword,
  getUserDetails,
  toggleBlockUser,
};
