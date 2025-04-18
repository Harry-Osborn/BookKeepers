const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  verifyOtp, // ✅ Added from code2
  resendOtp, // ✅ Added from code2
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 */
router.post("/register", registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT
 */
router.post("/login", loginUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user by clearing the token
 */
router.post("/logout", logoutUser);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP for unverified users
 */
router.post("/verify-otp", verifyOtp); // ✅ Added with comment

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP to user
 */
router.post("/resend-otp", resendOtp); // ✅ Added with comment

/**
 * @route   GET /api/auth/check-auth
 * @desc    Check if user is authenticated
 */
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user,
  });
});

/**
 * @route   GET /api/auth/checkapi
 * @desc    Test API endpoint
 */
router.get("/checkapi", (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "hello man",
    user,
  });
}); // ✅ Added with comment

module.exports = router;
