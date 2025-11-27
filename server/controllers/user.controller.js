import {
  refreshTokenOptions,
  accessTokenOptions,
  tokenOptions,
} from "../utils/token.utils.js";
import { register, login, update, getUser } from "../services/auth.service.js";
// import { getUser } from "../services/auth/user.service.js";

export const registerUser = async (req, res) => {
  try {
    const data = req.body;

    const response = await register(data);

    const tokens = response.tokens;

    return res
      .status(201)
      .cookie("accessToken", tokens.accessToken, accessTokenOptions)
      .cookie("refreshToken", tokens.refreshToken, refreshTokenOptions)
      .json({ message: "User registered successfully" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const data = req.body;

    const response = await login(data);

    const tokens = response.tokens;

    return res
      .status(200)
      .cookie("accessToken", tokens.accessToken, accessTokenOptions)
      .cookie("refreshToken", tokens.refreshToken, refreshTokenOptions)
      .json({ message: "Login successful" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const updateData = req.body;

    const response = await update(userId, updateData);

    return res.status(200).json({ message: "User updated successfully" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await getUser(req.userId);

    if (user) {
      return res.status(200).json(user);
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("accessToken", accessTokenOptions);
    res.clearCookie("refreshToken", refreshTokenOptions);
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
