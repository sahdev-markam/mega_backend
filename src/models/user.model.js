import mongoose, {Schema}  from "mongoose";
import jwt from "jsonwebtocken"
import bcrypt from "bcrypt"

const userSchema = new SchemaTypes({
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
    type: String

  },
},{timestamps: true})

userSchema.pre("seve",async function (next) {
  if(!this.isModified("password")) return next()
  this.password = bcrypt.hash(this.password, 10)
  next()
})

export const User = mongoose.model("User", userSchema)