import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import jwt from "jsonwebtoken";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function verifyToken(token, userId) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId === parseInt(userId);
  } catch (error) {
    return false;
  }
}
