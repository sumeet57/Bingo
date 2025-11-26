import express from "express";
import {
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validateLogin, validateRegister } from "../middlewares/validate.js";

const userRouter = express.Router();

userRouter.get("/", authenticate, getUserProfile);
userRouter.post("/login", validateLogin, loginUser);
userRouter.post("/register", validateRegister, registerUser);
userRouter.post("/logout", authenticate, logoutUser);

export default userRouter;
