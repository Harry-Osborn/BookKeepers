const express = require("express");
const upload = require("../../helpers/upload"); // Multer middleware
const {
  uploadProfileImage,
  getAllUsers,
  updateUser,
} = require("../../controllers/user/user-controller");

const router = express.Router();

/**
 * @route   POST /api/user/upload
 * @desc    Upload profile image to AWS S3
 */
router.post("/upload", upload.single("file"), uploadProfileImage);

/**
 * @route   GET /api/user
 * @desc    Fetch all users
 */
router.get("/", getAllUsers);

/**
 * @route   PUT /api/user/:id
 * @desc    Update user info by ID (username and/or profile image)
 */
router.put("/:id", updateUser);

module.exports = router;
