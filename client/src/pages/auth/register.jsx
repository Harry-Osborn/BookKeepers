import { useToast } from "@/components/ui/use-toast";
import { registerUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import OtpModal from "@/components/common/OtpModal";
import { motion } from "framer-motion";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [showStrength, setShowStrength] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showOtpModal, setShowOtpModal] = useState(false);

  const getPasswordStrength = (password) => {
    if (
      password.length > 8 &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*]/.test(password)
    ) {
      return "Strong";
    } else if (password.length > 6) {
      return "Moderate";
    } else {
      return "Weak";
    }
  };

  function onSubmit(event) {
    event.preventDefault();
    const newErrors = {};
    if (!formData.userName.trim()) newErrors.userName = "Username is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Enter a valid email";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    dispatch(registerUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({ title: data?.payload?.message });
        setShowOtpModal(true);
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") setShowStrength(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-gray-850 bg-opacity-90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-gray-700"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Create New Account
          </h1>
          <p className="mt-2 text-gray-400">
            Already have an account?
            <Link
              className="ml-2 text-blue-400 hover:underline font-medium"
              to="/auth/login"
            >
              Login
            </Link>
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label
              className="block text-sm text-gray-300 mb-1"
              htmlFor="userName"
            >
              Username
            </label>
            <input
              id="userName"
              name="userName"
              type="text"
              value={formData.userName}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.userName && (
              <p className="text-red-500 text-sm mt-1">{errors.userName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label
              className="block text-sm text-gray-300 mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            {showStrength && (
              <p
                className={`text-sm mt-1 ${
                  getPasswordStrength(formData.password) === "Strong"
                    ? "text-green-400"
                    : getPasswordStrength(formData.password) === "Moderate"
                    ? "text-yellow-400"
                    : "text-red-500"
                }`}
              >
                Strength: {getPasswordStrength(formData.password)}
              </p>
            )}
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white p-3 rounded-xl font-semibold tracking-wide shadow-lg transition-all duration-300"
          >
            Sign Up
          </motion.button>
        </form>
      </motion.div>

      <OtpModal
        isOpen={showOtpModal}
        email={formData.email}
        onClose={() => {
          setShowOtpModal(false);
          navigate("/auth/login");
        }}
        onSuccess={() => {
          setShowOtpModal(false);
          navigate("/auth/login");
        }}
      />
    </div>
  );
}

export default AuthRegister;
