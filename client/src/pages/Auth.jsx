import React, { useState, useContext, useCallback } from "react";
import { UserContext } from "../context/UserContext";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaSignInAlt,
  FaUserPlus,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const InputField = ({
  icon: Icon,
  type,
  name,
  id,
  placeholder,
  value,
  onChange,
}) => {
  const [inputType, setInputType] = useState(type);

  const toggleVisibility = () => {
    setInputType((prevType) => (prevType === "password" ? "text" : "password"));
  };

  const isPassword = type === "password";

  return (
    <div className="relative mb-4">
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type={inputType}
        name={name}
        id={id}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
        className="w-full pl-10 pr-10 py-2 border border-gray-700 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
      />
      {isPassword && (
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          aria-label={
            inputType === "password" ? "Show password" : "Hide password"
          }
        >
          {inputType === "password" ? <FaEye /> : <FaEyeSlash />}
        </button>
      )}
    </div>
  );
};

const Auth = () => {
  const { register, login, loading } = useContext(UserContext);

  const authTypes = {
    LOGIN: "login",
    REGISTER: "register",
  };

  const [authType, setAuthType] = useState(authTypes.LOGIN);
  const [formData, setFormData] = useState({
    fullName: {
      firstName: "",
      lastName: "",
    },
    email: "",
    password: "",
  });

  const updateValues = useCallback((e) => {
    const { value, name, id } = e.target;
    setFormData((prev) => {
      if (name === "fullName") {
        return {
          ...prev,
          [name]: {
            ...prev[name],
            [id]: value,
          },
        };
      } else {
        return {
          ...prev,
          [name]: value,
        };
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authType === authTypes.REGISTER) {
        await register(formData);
      } else {
        const { fullName, ...rest } = formData;
        await login(rest);
      }
    } catch (error) {
      console.error("Auth Error:", error);
    }
  };

  const toggleAuthType = () => {
    setAuthType((prevType) =>
      prevType === authTypes.LOGIN ? authTypes.REGISTER : authTypes.LOGIN
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-4">
      <div className="bg-zinc-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-white text-center">
          {authType === authTypes.LOGIN ? "Sign In" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit} key={authType}>
          {authType === authTypes.REGISTER && (
            <div className="flex gap-4">
              <div className="flex-1">
                <InputField
                  icon={FaUser}
                  type="text"
                  name="fullName"
                  id="firstName"
                  placeholder="First Name"
                  onChange={updateValues}
                  value={formData.fullName.firstName}
                />
              </div>
              <div className="flex-1">
                <InputField
                  icon={FaUser}
                  type="text"
                  name="fullName"
                  id="lastName"
                  placeholder="Last Name"
                  onChange={updateValues}
                  value={formData.fullName.lastName}
                />
              </div>
            </div>
          )}

          <InputField
            icon={FaEnvelope}
            type="email"
            name="email"
            id="email"
            placeholder="Email Address"
            onChange={updateValues}
            value={formData.email}
          />

          <InputField
            icon={FaLock}
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            onChange={updateValues}
            value={formData.password}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 mt-6 p-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 disabled:opacity-50"
          >
            {authType === authTypes.LOGIN ? <FaSignInAlt /> : <FaUserPlus />}
            {loading
              ? "Processing..."
              : authType === authTypes.LOGIN
              ? "Login"
              : "Register"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleAuthType}
            className="text-blue-400 hover:text-blue-300 transition duration-150 text-sm"
          >
            {authType === authTypes.LOGIN
              ? "Don't have an account? Sign Up"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
