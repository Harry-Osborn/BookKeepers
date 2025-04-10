const User = require("../../models/User");
const uploadFileToS3 = require("../../helpers/uploadtos3");

/**
 * Upload profile image to AWS S3
 */
const uploadProfileImage = async (req, res) => {
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
};

/**
 * Fetch all users
 */
const getAllUsers = async (req, res) => {
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
};

/**
 * Update user info by ID (username and/or profile image)
 */
const updateUser = async (req, res) => {
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
};

module.exports = {
  uploadProfileImage,
  getAllUsers,
  updateUser,
};
