import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.utils.js";
import asyncHandler from "./asyncHandler.middleware.js";
import User from "../models/user.model.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    throw new ApiError(401, "Unauthorized: No access token provided");
  }

  const decodedToken = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);

  const user = await User.findById(decodedToken.userId).select(
    "-password -__v -refreshToken -otp -otpExpiry"
  );

  if (!user) {
    throw new ApiError(401, "Unauthorized: User not found");
  }
  req.user = user;

  next();
});

export default authMiddleware;
