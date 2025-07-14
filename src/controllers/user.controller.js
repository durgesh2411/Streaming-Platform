import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";    // user import from Model
import { uploadOnClouddinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { use } from "react";

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

const createAccessAndRefreshTokens = async(userId) =>{   // fetch userId from user body as we have access to user object
   try {
      const user = await User.findById(userId);  // finding user by id
      const accessToken = user.generateAccessToken();  // generate access token using user model method and give it user
      // generate refresh token using user model method and keep in db regenerate access token
      const refreshToken = user.generateRefreshToken();
      //put token in table of refresh token in db
      user.refreshToken = refreshToken;
      // save user with new refresh token
      // when we try to save, model gets kicked in and password gets checked and hashed
      // add property password to user object
      await user.save({validateBeforeSave: false}); // skip validation as password is not required here
      // part done return both the tokens:
      return { accessToken, refreshToken };

   } catch (error) {
      throw new ApiError(500, "Token generation failed");  // server issue so 500 status code
   }
}

const loginUser = asyncHandler(async (req, res) =>{

   //1. req body  --> data retrieval
   const { email, username, password } = req.body;
   //2. username or email based validation:
   if (!email || !username) {
      throw new ApiError(400, "Email and username both are required");
   }
   //3. find the user in db
   const user = await User.findOne({
      $or: [{email}, {username}]
   })
   if(!user){
      throw new ApiError(404, "User not found");
   }
   //4. password validation
   const isPasswordvalid = await user.isPasswordValid(password)

   if(!isPasswordvalid){
      throw new ApiError(401, "Invalid password");
   }
   //5. access and refresh token generation
   const { accessToken, refreshToken } = await createAccessAndRefreshTokens(user._id);

   //6. send this tokens in cookies
         // what all info we need to send to user:
         // now since the user instance we used before is empty, we need to fetch the user again
   const userWithTokens = await User.findById(user._id).select(
      "-password -refreshToken") // exclude password and refreshToken from the response

      // now we send coocies(we need create options for cookies):
      const cookiesOptions = {
         httpOnly: true, // prevent client-side JS from accessing the cookies
         secure : true, // use secure cookies in production (HTTPS) ony mod. by server
      }

      return res
      .status(200)
      .cookie("accessToken", accessToken, cookiesOptions)   // we can use .cookie by use of middleware(cookieParser)
      .cookie("refreshToken", refreshToken, cookiesOptions)
      .json(
         new ApiResponse(200,      // 1.satus code
            {
               user: userWithTokens,
               accessToken,   // for user to save additional info in local storage(2. data)
               refreshToken
            },
            "User logged in successfully"  //3. message
         )
      )



})

const logOutUser = asyncHandler(async (req, res) =>{
   // 1. delete the refresh token from the user document
   // 2. clear the cookies
   // once we applied auth middle ware now we have user as obj in req
  await  User.findByIdAndUpdate(
      req.user._id,
      {
         $set: {refreshToken: undefined}      // remove the refresh token from the user document
      },
      {
         new: true                         // return the updated user document
      }
   )

         const cookiesOptions = {
         httpOnly: true, // prevent client-side JS from accessing the cookies
         secure : true, // use secure cookies in production (HTTPS) ony mod. by server
      }

      res.status(200)
      .clearCookie("accessToken", cookiesOptions) // clear the access token cookie
      .clearCookie("refreshToken", cookiesOptions) // clear the refresh token cookie
      .json(new ApiResponse(200, null, "User logged out successfully"));
})

export {
   registerUser,
   loginUser,
   logOutUser
 };
