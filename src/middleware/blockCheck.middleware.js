import ApiError from "../utils/apiError.utils.js";
import asyncHandler from "./asyncHandler.middleware.js";

const isBlocked = asyncHandler((req, res, next) => {
  if (req.user.isBlocked === true) {
    throw new ApiError(
      403,
      "Your account has been blocked. you cannot perform this action."
    );
  }
  next();
});

export default isBlocked;
