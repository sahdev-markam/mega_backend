import mongoose, {Schema}  from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  fullname: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  avatar: {
    type: String,
    //cloucinary url
    required: true
  },
  coverImage:{
    type: String,//cloudinary url
  },
  password: {
    type: String,
    required: [true, 'password is required']
  },
  watchHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: "video"
    }
  ],
  refreshToken:{
    type: String,
  },
},{timestamps: true})

userSchema.pre("seve",async function (next) {
  if(!this.isModified("password")) return next()
  const salt = await bcrypt.genSalt(8);
  const hash = await bcrypt.hash(this.Password, salt);
  console.log("hash of password", hash);
  
  this.password = hash
  next()
  return this.password
})
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ 
    id: this._id,
    email: this.email, 
    username: this.username,
    fullname: this.fullname }, 
    process.env.ACCESS_TOKEN_SECRET, 
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
  )
}

userSchema.methods.generateRefreshToken = function () {
return jwt.sign({ 
    id: this._id
  },
    process.env.REFRESH_TOKEN_SECRET, 
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
  )
}

export const User = mongoose.model("User", userSchema)