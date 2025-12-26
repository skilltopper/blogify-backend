import Blog from "../models/blog.model.js";
import ApiError from "../utils/apiError.utils.js";
import asyncHandler from "./asyncHandler.middleware.js";

const checkBlogOwnership = asyncHandler(async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).select(
      "-password, -refreshToken -__v"
    );

    if (!blog) {
      throw new ApiError(404, "Blog not found");
    }

    // Admin override
    if (req.user.role === "admin") {
      req.blog = blog;
      return next();
    }

    // Ownership check
    if (blog.userId.toString() !== req.user.id) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action"
      );
    }

    req.blog = blog;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Ownership check failed",
    });
  }
});

export default checkBlogOwnership;
