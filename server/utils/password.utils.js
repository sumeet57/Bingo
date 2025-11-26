import bcrypt from "bcryptjs";

export const hashPassword = async (password) => {
  try {
    const saltRounds = process.env.SALT_ROUNDS;
    const salt = await bcrypt.genSalt(parseInt(saltRounds, 10));

    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password");
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};
