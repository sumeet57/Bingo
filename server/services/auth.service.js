import User from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/password.utils.js";

export const register = async (data) => {
  try {
    const hashedPassword = await hashPassword(data.password);
    const user = await User.create({
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
    });
    await user.save();

    return user._id;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const login = async (data) => {
  try {
    const user = await User.findOne({ email: data.email }).select("+password");
    if (!user) {
      throw new Error("User is not registered");
    } else {
      const comparedPassword = await comparePassword(
        data.password,
        user.password
      );
      if (!comparedPassword) {
        throw new Error("Invalid email or password");
      } else {
        return user._id;
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
