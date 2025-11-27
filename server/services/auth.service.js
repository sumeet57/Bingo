import User from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/password.utils.js";
import { generateToken } from "../utils/token.utils.js";
export const register = async (data) => {
  try {
    const isExistingUser = await User.findOne({ email: data.email });
    if (isExistingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(data.password);
    data.password = hashedPassword;
    const user = await User.create(data);

    const tokens = generateToken(user._id);

    await user.save();

    if (!user || !tokens || !tokens.accessToken || !tokens.refreshToken) {
      throw new Error("Registration failed");
    }

    return {
      tokens,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const login = async (data) => {
  try {
    const existingUser = await User.findOne({ email: data.email }).select(
      "+password"
    );
    if (!existingUser) {
      throw new Error("User is not registered");
    }
    const isPasswordValid = await comparePassword(
      data.password,
      existingUser.password
    );
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }
    const tokens = generateToken(existingUser._id);

    if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
      throw new Error("Login failedd");
    }
    return {
      tokens,
    };
  } catch (error) {
    console.log("Login error:", error.message);
    throw new Error(error.message);
  }
};

export const getUser = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const update = async (userId, updateData) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );
    if (!updatedUser) {
      throw new Error("User not found");
    }
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};
