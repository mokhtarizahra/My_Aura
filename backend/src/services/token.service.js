import jwt from "jsonwebtoken";

export const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

export const decodeToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const getRoleFromToken = (token) => {
  const decoded = decodeToken(token);
  return decoded?.role || null;
};