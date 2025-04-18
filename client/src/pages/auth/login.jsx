import OtpModal from "@/components/common/OtpModal";
import { useToast } from "@/components/ui/use-toast";
import { loginUser } from "@/store/auth-slice";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function DarkLoginUI() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (event) => {
    event.preventDefault();

    dispatch(loginUser(formData)).then((action) => {
      const { payload } = action;

      if (action.type.endsWith("/fulfilled") && payload?.success) {
        toast({
          title: payload.message,
        });
      } else if (
        action.type.endsWith("/rejected") &&
        payload?.message == "Account not verified. OTP sent."
      ) {
        toast({
          title: payload.message,
          variant: "destructive",
        });
        setShowOtpModal(true);
        console.log(showOtpModal);
      } else {
        console.log(payload);
        toast({
          title: "var" + payload?.message || "Login failed. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gray-850 bg-opacity-90 backdrop-blur-lg p-12 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-700"
        >
          <h2 className="text-4xl font-bold mb-10 text-center text-white tracking-wide">
            🔒 Sign In to Your Library
          </h2>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-4 bg-gray-800 text-white placeholder-gray-500 rounded-xl border ${
                  errors.email ? "border-red-500" : "border-gray-700"
                } focus:outline-none focus:ring-2 focus:ring-blue-600 transition`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-4 pr-12 bg-gray-800 text-white placeholder-gray-500 rounded-xl border ${
                  errors.password ? "border-red-500" : "border-gray-700"
                } focus:outline-none focus:ring-2 focus:ring-blue-600 transition`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white p-4 rounded-xl font-semibold tracking-wide shadow-lg transition-all duration-300"
            >
              Sign In
            </motion.button>

            <p className="text-gray-500 text-center mt-8 text-sm">
              Don’t have an account?
              <Link
                to="/auth/register"
                className="text-blue-400 hover:underline ml-1"
              >
                Create one
              </Link>
            </p>
          </form>
        </motion.div>
      </div>

      <OtpModal
        isOpen={showOtpModal}
        email={formData.email}
        onClose={() => setShowOtpModal(false)}
        onSuccess={() => {
          setShowOtpModal(false);
        }}
      />
    </>
  );
}
