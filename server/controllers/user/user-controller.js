const User = require("../../models/User");
const uploadFileToS3 = require("../../helpers/uploadtos3");

/**
 * @desc    Upload profile image to AWS S3
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
 * @desc    Get a single user by ID
 */
const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const reUser = {
      name: user.userName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
    };

    return res.status(200).json(reUser);
  } catch (error) {
    console.error("❌ Error fetching user:", error.message);
    return res.status(500).json({
      message: "Error fetching user",
      error: error.message,
    });
  }
};

/**
 * @desc    Update user info by ID (username only)
 */
const updateUserName = async (req, res) => {
  try {
    const { userName } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.userName = userName;
    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error.message);
    return res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
};

/**
 * @desc    Change profile picture of the user
 */
const changeProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const imageUrl = await uploadFileToS3(req.file, "profile-images");
    await User.findByIdAndUpdate(
      req.user.id,
      { profileImageUrl: imageUrl },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Image updated Successfully", imageUrl });
  } catch (error) {
    console.error("❌ S3 upload failed:", error.message);
    return res.status(500).json({
      message: "S3 upload failed",
      error: error.message,
    });
  }
};

module.exports = {
  uploadProfileImage,
  getUserById,
  updateUserName,
  changeProfilePicture,
};
