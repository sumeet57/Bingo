import { comparePassword, hashPassword } from "../utils/password.utils.js";
import User from "../models/user.model.js";
import { generateToken, tokenOptions } from "../utils/token.utils.js";
import { login, register } from "../services/auth.service.js";

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const userId = await register({ fullName, email, password });
    const tokens = generateToken(userId);
    return res
      .status(201)
      .cookie("accessToken", tokens.accessToken, tokenOptions)
      .cookie("refreshToken", tokens.refreshToken, tokenOptions)
      .json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in registerUser:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userId = await login({ email, password });

    const tokens = generateToken(userId);

    return res
      .status(200)
      .cookie("accessToken", tokens.accessToken, tokenOptions)
      .cookie("refreshToken", tokens.refreshToken, tokenOptions)
      .json({ message: "Login successful" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("accessToken", tokenOptions);
    res.clearCookie("refreshToken", tokenOptions);
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
