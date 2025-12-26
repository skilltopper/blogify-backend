import express from "express";

import asyncHandler from "../middleware/asyncHandler.middleware.js";
import {
  createBlogValidation,
  updateBlogValidation,
  validate,
} from "../middleware/validtor.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";
import isBlocked from "../middleware/blockCheck.middleware.js";
import { upload } from "../middleware/blogMulter.middleware.js";
import {
  createBlog,
  updateBlog,
  getAllUserBlogs,
  getAllSingleBlogs,
  deleteBlog,
  getAllBlogs,
} from "../controllers/blog.controller.js";
import checkBlogOwnership from "../middleware/ownerShipCheck.middleware.js";

const router = express.Router();

router
  .route("/create")
  .post(
    authMiddleware,
    isBlocked,
    upload.single("featuredImage"),
    createBlogValidation,
    validate,
    asyncHandler(createBlog)
  );

router
  .route("/update/:id")
  .patch(
    authMiddleware,
    isBlocked,
    checkBlogOwnership,
    upload.single("featuredImage"),
    updateBlogValidation,
    validate,
    asyncHandler(updateBlog)
  );

router
  .route("/delete/:id")
  .delete(
    authMiddleware,
    isBlocked,
    checkBlogOwnership,
    asyncHandler(deleteBlog)
  );

router.route("/get").get(asyncHandler(getAllBlogs));

router.route("/get/:id").get(asyncHandler(getAllSingleBlogs));

router.route("/user-posts").get(authMiddleware, asyncHandler(getAllUserBlogs));

export default router;
