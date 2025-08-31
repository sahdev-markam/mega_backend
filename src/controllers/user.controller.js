import asyncHandler from "../utils/asyncHandler.promiss.js"
import apiError from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const registerUser = asyncHandler(async (req, res) => {
  // Registration logic here
  /*
  get user details from frontend
  validation - not empty
  check if user already exists: username , email
  check for image,check for avatar
  create user object - create entry in db
  remove password and refresh token field from response
  check for user creation
  return res
  */

  const { fullname, email, password, username } = req.body
  console.log("fullName :",fullname);
  if (
    [fullname,email,username,password].some((field) => field?.trim() === "")
  ) {
   throw apiError( 400, "All fields are required");
  }
  User.findOne({
    $or: [{ email }, { username }]
  }).then((existingUser) => {
    if (existingUser) {
     throw new ApiError(400, "User already exists");
  }})
  console.log(req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath = req.files?.coverImage[0]?.path
  if(!avatarLocalPath)throw new ApiError(400, "avatar file is required")
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = uploadOnCloudinary(coverImageLocalPath)
  if (!avatar) {throw new ApiError(400, "avatar file is required")}
   // Create user object and save to database
  const user = await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
  });

  const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createduser) {
    throw new ApiError(500, "Somthing went wrong while registering the user")
  };
  return res.status(201).json(
    new ApiResponse(200, createduser, "user register successfully")
  )

})

export { registerUser }