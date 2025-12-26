import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      `${process.env.MONGODB_URI}/blog-project`
    );
    console.log("Connection done")
  } catch (error) {
    console.log("errpr", error);
  }
};

export default connectDB;
