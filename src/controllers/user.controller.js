import asyncHandler from "../utils/asyncHandler.promiss.js"
import apiError from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessTokenAndRefreshTokens = async(userId)=>{
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})
    return {accessToken, refreshToken}
  } catch (error) {
    throw new ApiError(500, "somthing went wrong while genrating referesh and access token")
  }
}

//register user methods
const registerUser = asyncHandler(async (req, res) => {
  // Registration logic here
  const { fullname, email, password, username } = req.body
  console.log("request body :", req.body,"request files:",req.files);
  if (
    [fullname,email,username,password].some((field) => field?.trim() === "")
  ) {
   throw apiError( 400, "All fields are required");
  }
  await User.findOne({
    $or: [{ email }, { username }]
  }).then((existingUser) => {
    if (existingUser) {
     throw new ApiError(400, "User already exists");
  }})
  //  console.log(req);
  const avatarLocalPath = req.files?.avatar[0]?.path
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path
  }
  //console.log("req.files",req.files);
  
  if(!avatarLocalPath)throw new ApiError(400, "avatar file is required")
  // const avatar = await uploadOnCloudinary(avatarLocalPath)
  // const coverImage = uploadOnCloudinary(coverImageLocalPath)
  // if (!avatar) {throw new ApiError(400, "avatar file is required")}
  // console.log("cloudnary", avatar,);
  
   // Create user object and save to database
  const user = await User.create({
    fullname,
    avatar:avatarLocalPath,
    coverImage: coverImageLocalPath || "",
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

//loggedin user methods
const loginUser = asyncHandler(async (req, res) => {
  //console.log("login request",res);
  
  const {email, username, password} = req.body
  //console.log('password',password);
  
  if (!username && !email){
    throw new ApiError(400, "username or email is required")
  }
const user = await User.findOne({
    $or: [{username},{email}]
  })
  console.log('user', user);
  
  if (!user) {
    throw new ApiError(404, "user dose not exist") 
  }

  const passwordValid = await user.isPasswordCorrect(password)

  if (!passwordValid) {
    console.log('Invalid password',passwordValid);
    throw new ApiError(401, "invalid user credentials")
  }

  const {accessToken, refreshToken} =  await generateAccessTokenAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnlY: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken" , accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser, accessToken, refreshToken
      },
      "user logged in successfully"
    )
  )


})

// logout user methods
const logoutUser = asyncHandler(async(req, res) => {
  
  const userId = req.user._id
  await User.findByIdAndUpdate(
    userId, 
    {
    $set:{ refreshToken: undefined }
    }, 
    {
    new: true
    }
  )
  const options = {
    httpOnly: true,
    secure: true
  }
  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, null, "user logged out successfully"))
})

const refreshAcessToken = asyncHandler(async function(req, res) {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = User.findById(decodedToken?._id)
  
    if (!user) {
      throw new ApiError(401, "Invalid refresh token")
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh token is expired or used")
    }
  
    const options = {
      httpOnlY: true,
      secure: true
    }
  
    const {newRefreshToken,accessToken} = await generateAccessTokenAndRefreshTokens(user._id)
    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken",newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {accessToken, refreshToken: newRefreshToken}
      )
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refreshToken")
  }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  //if (!(newPassword === confPassword)) {throw new ApiError();}
  const {oldpassword, newPassword} = req.body
  const user = await User.findById(req.user?._id)

  const isPasswordCorrect = await user.isPasswordCorrect(oldpassword)

  if (!isPasswordCorrect) {
    throw new ApiError(400, "invalid old password")
  }

  user.password = newPassword
  await user.save({validateBeforeSave: false})

  return res
  .status(200)
  .json(new ApiResponse(200,{}, "password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res)=>{
  return res
  .status(200)
  .json(200, req.user, "current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async (req, res)=>{
  const {fullName, email} = req.body
  if (!fullName || !email) {
    throw new ApiError(400, "all fields are required")
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName,
        email: email
      }
    },
    {new: true}
  ).select("-password -refreshToken")
  return res
  .status(200)
  .json(new ApiResponse(200, user, "Account details updated successfull"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is missing")
  }

  // const avatar = await uploadOnCloudinary(avatarLocalPath)
  // if (!avatar) {
  //   throw new ApiError(400, "Error while uploade on cloudinary")
  // }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar: avatarLocalPath
      }
    },
    {new: true}
  ).select("-password -refreshToken")

  return res
  .status(200)
  .json(
    new ApiResponse(200,user, "avatar updated successfully")
  )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path
  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage file is missing")
  }

  // const avatar = await uploadOnCloudinary(coverImageLocalPath)
  // if (!avatar) {
  //   throw new ApiError(400, "Error while uploade on cloudinary")
  // }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage: coverImageLocalPath
      }
    },
    {new: true}
  ).select("-password -refreshToken")

  return res
  .status(200)
  .json(
    new ApiResponse(200,user, "avatar updated successfully")
  )
})

export { 
  registerUser, 
  loginUser,
  logoutUser,
  refreshAcessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,

}