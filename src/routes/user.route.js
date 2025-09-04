import { Router } from "express";
import {registerUser,loginUser,logoutUser, refreshAcessToken} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";


const userRouter = Router();

userRouter.route("/register").post(upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]), registerUser);

userRouter.route("/login").post(loginUser);

// secured routes
userRouter.route("/logout").post(verifyjwt, logoutUser);

userRouter.route("/refresh-Token").post(refreshAcessToken)

export default userRouter;