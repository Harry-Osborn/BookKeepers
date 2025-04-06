const express = require("express");
const User = require("../models/User");
const upload = require("../helpers/upload"); // Multer middleware
const uploadFileToS3 = require("../helpers/uploadtos3"); // S3 helper

const router = express.Router();

/**
 * @route   POST /api/user/upload
 * @desc    Upload profile image to AWS S3
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = await uploadFileToS3(req.file, "profile-images");

    return res.status(200).json({ message: "Image uploaded", imageUrl });
  } catch (error) {
    console.error("❌ S3 upload failed:", error.message);
    return res.status(500).json({
      message: "S3 upload failed",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/user
 * @desc    Fetch all users
 */
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    return res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/user/:id
 * @desc    Update user info by ID (username and/or profile image)
 */
router.put("/:id", async (req, res) => {
  try {
    const { userName, profileImageUrl } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { userName, profileImageUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error.message);
    return res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
});

module.exports = router;
