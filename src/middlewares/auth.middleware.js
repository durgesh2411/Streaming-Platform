import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
// when we do login user gets access and refresh token, we can use these tokens to varify, once done add it to req as an obj. in form of req.user( just like req.body)
export const verifyJWT = asyncHandler(async(req, res, next) => {
   // how get the tokens access:
   // int req. header the format is Authorization bearer <token>
try {
         const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
         // check if token is present
         if(!token){
            throw new ApiError(401, "Unauthorized access, token not found");
         }
         // if correct token then verify it:
         const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
         const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

         // if user not found
         if(!user){
            throw new ApiError(404, "User not found");
         }

         //if user found then add it to req object
         req.user = user; // add user to req object
         next(); // call next middleware
} catch (error) {
   throw new ApiError(401, error?.message || "Unauthorized access, invalid token");
}
})
