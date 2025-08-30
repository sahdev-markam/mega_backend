import asyncHandler from "../utils/asyncHandler.promiss.js"

const registerUser = asyncHandler(async (req, res) => {
  // Registration logic here
  res.status(201).json({ message: "User registered successfully" })
})

export { registerUser }