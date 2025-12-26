import jwt from "jsonwebtoken";

export const generateAccessToken = (userId) => {
  // Generate a JWT token for the user
  const token = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });
  return token;
};

export const generateRefreshToken = (userId) => {
  // Generate a refresh JWT token for the user
  const token = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
  return token;
};
