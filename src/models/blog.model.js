import mongoose, { Schema, model } from "mongoose";

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    featuredImage: {
      url: String,
      public_id: String,
    },
  },
  { timestamps: true }
);

const Blog = model("Blog", blogSchema);

export default Blog;
