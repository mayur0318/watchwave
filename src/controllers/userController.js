import { User } from "../models/userModels.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

  if (
    [userName, fullName, email, password].some((field) => field?.trim() === "")
  ) {
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
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

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
  console.log(user);
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

export { registerUser };
