const express = require("express");
const router = express.Router();
const upload = require("../../helpers/upload"); // Multer middleware
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const {
  uploadProfileImage,
  getUserById,
  updateUserName,
  changeProfilePicture,
} = require("../../controllers/user/user-controller");

/**
 * @route   POST /api/user/upload
 * @desc    Upload profile image to AWS S3
 */
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadProfileImage
);

/**
 * @route   PUT /api/user/getUser/:userId
 * @desc    Get user data by ID
 */
router.put("/getUser/:userId", authMiddleware, getUserById);

/**
 * @route   PUT /api/user/:id
 * @desc    Update user info by ID (username only)
 */
router.put("/:id", authMiddleware, updateUserName);

/**
 * @route   POST /api/user/profileChange
 * @desc    Update user profile image
 */
router.post(
  "/profileChange",
  authMiddleware,
  upload.single("file"),
  changeProfilePicture
);

module.exports = router;
