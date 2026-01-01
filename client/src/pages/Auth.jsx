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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none z-10" />
      <input
        type={type === "password" && showPassword ? "text" : type}
        name={name}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-11 pr-12 py-3.5 bg-zinc-900/70 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
        autoComplete="off"
      />
      {type === "password" && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
        >
          {showPassword ? <FaEyeSlash size={19} /> : <FaEye size={19} />}
        </button>
      )}
    </div>
  );
};

const Auth = () => {
  const { register, login, loading } = useContext(UserContext);
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    fullName: { firstName: "", lastName: "" },
    email: "",
    password: "",
  });

  const updateValues = useCallback((e) => {
    const { name, id, value } = e.target;
    setFormData((prev) => {
      if (name === "fullName") {
        return {
          ...prev,
          fullName: { ...prev.fullName, [id]: value },
        };
      }
      return { ...prev, [name]: value };
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register(formData);
      }
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Glass Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Bingo Arena</h1>

            <p className="text-zinc-400 mt-2 text-sm">
              {isLogin ? "Welcome back!" : "Create your account"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First & Last Name — Perfect on all screens */}
            {!isLogin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  icon={FaUser}
                  type="text"
                  name="fullName"
                  id="firstName"
                  placeholder="First Name"
                  value={formData.fullName.firstName}
                  onChange={updateValues}
                />
                <InputField
                  icon={FaUser}
                  type="text"
                  name="fullName"
                  id="lastName"
                  placeholder="Last Name"
                  value={formData.fullName.lastName}
                  onChange={updateValues}
                />
              </div>
            )}

            <InputField
              icon={FaEnvelope}
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={updateValues}
            />

            <InputField
              icon={FaLock}
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={updateValues}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-zinc-700 disabled:to-zinc-800 text-white font-bold rounded-xl shadow-lg transform active:scale-98 transition-all duration-200 flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                "Please wait..."
              ) : (
                <>
                  {isLogin ? <FaSignInAlt /> : <FaUserPlus />}
                  {isLogin ? "Sign In" : "Create Account"}
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300 font-medium text-sm transition"
            >
              {isLogin
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs mt-10">
          Real-time multiplayer bingo • Made with passion
        </p>
      </div>
    </div>
  );
};

export default Auth;
