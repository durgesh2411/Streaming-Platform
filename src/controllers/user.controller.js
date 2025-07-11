import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnClouddinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
//   console.log("Request body:", req.body);
//   console.log("Request files:", req.files);

  const { fullName, email, password, username } = req.body;
  console.log("reading body:", req.body);

  // Validation - check if all required fields are provided
  if (
    [fullName, email, password, username].some(
      (field) => !field || field.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { email: email.trim().toLowerCase() },
      { username: username.trim().toLowerCase() },
    ],
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  // Handle file uploads - avatar is MANDATORY
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  let coverImagesLocalPath =  null;
  if (
    req.files &&
    Array.isArray(req.files.coverImages) &&
    req.files.coverImages.length > 0
  ) {
    coverImagesLocalPath = req.files.coverImages[0].path;
  }

//   console.log("Avatar local path:", avatarLocalPath);
//   console.log("Cover image local path:", coverImagesLocalPath);

  // Avatar is required
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Try to upload avatar to cloudinary
//   console.log("Starting avatar upload to Cloudinary...");
  const avatarOnCloud = await uploadOnClouddinary(avatarLocalPath);
//   console.log("Avatar upload result:", avatarOnCloud);

  // Try to upload cover image to cloudinary (optional)
  let coverImagesOnCloud = null;
  if (coverImagesLocalPath) {
   //  console.log("Starting cover image upload to Cloudinary...");
    coverImagesOnCloud = await uploadOnClouddinary(coverImagesLocalPath);
   //  console.log("Cover image upload result:", coverImagesOnCloud);
   if(!coverImagesOnCloud){
      throw new ApiError(400, "Cover image upload failed");
   }
  }

  // Determine avatar URL (Cloudinary or local fallback)
  let avatarUrl;
  if (avatarOnCloud && avatarOnCloud.url) {
    avatarUrl = avatarOnCloud.url;
    console.log("Using Cloudinary avatar URL");           // extra hai
  } else {
    // Fallback to local file URL
    avatarUrl = `http://localhost:${process.env.PORT || 8000}/uploads/${req.files.avatar[0].filename}`;
    console.log("Using local avatar URL fallback");
  }

  // Create user with appropriate URLs
  const user = await User.create({
    fullName,
    avatar: avatarUrl,
    coverImages: coverImagesOnCloud?.url || "",
    email: email.trim().toLowerCase(),
    username: username.trim().toLowerCase(),
    password, // Will be hashed by pre-save middleware
  });

  // Get created user without sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "User creation failed");
  }

  // Return success response
  const message = avatarOnCloud
    ? "User registered successfully"
    : "User registered successfully (with local avatar - please configure Cloudinary for production)";

  return res.status(201).json(new ApiResponse(201, createdUser, message));
});

export { registerUser };
