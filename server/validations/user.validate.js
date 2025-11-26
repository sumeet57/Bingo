import Joi from "joi";

export const registerSchema = Joi.object({
  fullName: Joi.object({
    firstName: Joi.string().trim().required().messages({
      "string.base": "First name must be a string",
      "string.empty": "First name is required",
      "any.required": "First name is required",
    }),
    lastName: Joi.string().trim().required().messages({
      "string.base": "Last name must be a string",
      "string.empty": "Last name is required",
      "any.required": "Last name is required",
    }),
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .trim()
    .lowercase()
    .required()
    .messages({
      "string.base": "Email must be a string",
      "string.empty": "Email is required",
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  password: Joi.string().min(6).max(12).required().messages({
    "string.base": "Password must be a string",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
    "string.max": "Password must be at most 12 characters long",
    "any.required": "Password is required",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .trim()
    .lowercase()
    .required()
    .messages({
      "string.base": "Email must be a string",
      "string.empty": "Email is required",
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  password: Joi.string().min(6).max(12).required().messages({
    "string.base": "Password must be a string",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
    "string.max": "Password must be at most 12 characters long",
    "any.required": "Password is required",
  }),
});
