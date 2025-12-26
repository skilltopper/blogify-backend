import ApiError from "../utils/apiError.utils.js";

const adminCheck = (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Access denied, admin only");
  }
  next();
};

export default adminCheck;
