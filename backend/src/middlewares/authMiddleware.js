import { User } from "../models/userModels.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  // console.log("verifyJWT middleware called");
  try {
    // Step 1 — Extract token from request
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    // console.log("Token", token);
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Step 2 — Verify the token is real and not expired
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Step 3 — Find the actual user
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken",
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    // Step 4 — Attach user to request
    req.user = user;
    // This is how req.user exists in your logoutUser controller — verifyJWT PUT it there!
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
