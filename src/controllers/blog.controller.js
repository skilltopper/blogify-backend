import cloudinary from "../config/cloudinary.config.js";
import Blog from "../models/blog.model.js";
import ApiError from "../utils/apiError.utils.js";
import ApiResponse from "../utils/apiRespoce.utils.js";

const createBlog = async (req, res) => {
  const { title, content } = req.body;
  const featuredImage = req.file ? req.file.path : "";
  const imagePublicId = req.file ? req.file.filename : "";

  const newBlog = new Blog({
    title,
    content,
    userId: req.user._id,
    featuredImage: {
      url: featuredImage,
      public_id: imagePublicId,
    },
  });

  await newBlog.save();

  res.status(201).json(
    new ApiResponse(201, "Blog created successfully", {
      blog: newBlog,
      autherName: req.user.name,
    })
  );
};

const updateBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    const blog = req.blog; // coming from middleware (already fetched)

    // ================= IMAGE HANDLING =================
    if (req.file) {
      // delete old image if exists
      if (blog.featuredImage?.public_id) {
        await cloudinary.uploader.destroy(blog.featuredImage.public_id);
      }

      blog.featuredImage = {
        url: req.file.path, // string ✅
        public_id: req.file.filename,
      };
    }

    // ================= TEXT UPDATE =================
    if (title) blog.title = title;
    if (content) blog.content = content;

    await blog.save();

    res.status(200).json(
      new ApiResponse(200, "Blog updated successfully", {
        blog,
        authorName: req.user.name,
      })
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiResponse(500, "Failed to update blog"));
  }
};

const deleteBlog = async (req, res) => {
  // Delete the featured image from Cloudinary

  if (req.blog.featuredImage.public_id) {
    await cloudinary.uploader.destroy(req.blog.featuredImage.public_id);
  }

  await Blog.findByIdAndDelete(req.params.id);

  res.status(200).json(
    new ApiResponse(200, "Blog deleted successfully", {
      blog: req.blog,
      autherName: req.user.name,
    })
  );
};

const getAllBlogs = async (req, res) => {
  const blogs = await Blog.find().populate("userId", "name email");

  res
    .status(200)
    .json(new ApiResponse(200, "Blogs fetched successfully", blogs));
};

const getAllSingleBlogs = async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate(
    "userId",
    "name email"
  );

  res.status(200).json(new ApiResponse(200, "Blog fetched successfully", blog));
};

const getAllUserBlogs = async (req, res) => {
  const blogs = await Blog.find({ userId: req.user._id }).populate(
    "userId",
    "name email"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "User blogs fetched successfully", blogs));
};

export {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  getAllSingleBlogs,
  getAllUserBlogs,
};
