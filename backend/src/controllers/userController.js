import { User } from "../models/userModels.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
} from "../utils/cookieOptions.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // *** ALGORITHM For Register the user ***
  // get details of the user
  // validation - check non of the detail should be empty
  // check user is already exists or not - check the username of email is unique
  // check for images and check for avtar
  // upload them to cloudinary
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response

  // step 1 - get details of the user
  const { userName, fullName, email, password } = req.body;
  // console.log("email: ", email);

  // step 2 - validation - check non of the detail should be empty
  /*
    We can write this given below type of code for all the fileds..but we would write in new method
      if (fullName === "") {
        throw new ApiError(400, "fullName is required!");
      }
  */

  if ([userName, fullName, email, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  // step 3 - check user is already exists or not - check the username of email is unique
  const existedEmail = await User.findOne({ email });
  const existedUserName = await User.findOne({ userName });

  if (existedEmail) {
    throw new ApiError(409, "User with this email already exists");
  }
  if (existedUserName) {
    throw new ApiError(409, "User with this userName already exists");
  }

  //   const existedUser = await User.findOne({
  //     $or: [{ email }, { userName }]
  // });

  // if (existedUser) {
  //     throw new ApiError(409, "User with this email or username already exists");
  // }

  //step 4 - check for the avatar and coverImage path
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Step 5: Upload images to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Step 6: Create user
  const user = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });
  // console.log(user);
  // Step 7: Remove password and refreshToken from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  // Step 8: Send response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // console.log("Inside loginUser");
  // Steps For Login the User
  // get the details of the user ( userName, email and password )
  //check that email and username are not empty
  // check that the email or username is already exists
  // compare the password provided by the user
  // generate the Access Token and Refresh Token
  // Save both the tokens in DB
  // return response

  const { userName, email, password } = req.body;

  if (!userName && !email) {
    throw new ApiError(400, "userName or email is required");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  // console.log("User Obj: ", user);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  // console.log("Logged In User: ", loggedInUser);

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenCookieOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
        },
        "User logged In Successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // console.log("logoutUser controller called");
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },
  );

  return res
    .status(200)
    .clearCookie("accessToken", clearCookieOptions)
    .clearCookie("refreshToken", clearCookieOptions)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, accessTokenCookieOptions)
      .cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions)
      .json(new ApiResponse(200, {}, "Access token refreshed"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const updateCurrentPassword = asyncHandler(async (req, res) => {
  // ---> Steps for updating the current passoward <---
  // get the old and new password of the user
  // check the old and new password filed is not empty
  // find the user for comparing both password
  // use isPasswordCorrect method ( userModels.js)
  // if both password( oldPassword & Password in DB) matches then save new password
  // save the user and send successfull message

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Both password required");
  }

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid Password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched Successfully!"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, userName } = req.body;
  if (!fullName) {
    throw new ApiError(400, "FullName is Empty");
  }
  if (!userName) {
    throw new ApiError(400, "UserName is Empty");
  }
  if (!email) {
    throw new ApiError(400, "email is Empty");
  }

  // Check if email OR username is already taken by a DIFFERENT user
  const existingUser = await User.findOne({
    $or: [{ email }, { userName }],
    _id: { $ne: req.user?._id }, // $ne = "not equal" — excludes the current user
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new ApiError(409, "Email is already taken");
    }
    if (existingUser.userName === userName) {
      throw new ApiError(409, "Username is already taken");
    }
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
        userName,
      },
    },
    {
      new: true,
    },
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar?.url) {
    throw new ApiError(400, "Error while uploading avatar file");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    },
  ).select("-password, -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Avatar is updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage?.url) {
    throw new ApiError(400, "Error while uploading Cover Image file");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    },
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, " Cover Image is updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;

  if (!userName?.trim()) {
    throw new ApiError(400, "Username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        userName: userName?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User Channel fetched successfully"),
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    userName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "watch history fetched successfully",
      ),
    );
});

const ALLOWED_THEMES = ["auto", "light", "dark"];

const updateTheme = asyncHandler(async (req, res) => {
  const { theme } = req.body;

  if (typeof theme !== "string" || !ALLOWED_THEMES.includes(theme)) {
    throw new ApiError(400, "Theme must be one of: auto, light, dark");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { theme } },
    { new: true, runValidators: true },
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Theme updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  updateTheme,
};
