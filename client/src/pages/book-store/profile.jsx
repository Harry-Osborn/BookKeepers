import { useEffect, useState } from "react";
import {
  fetchBooksFromDB,
  fetchUserFromDB,
  updateUserInDB,
  uploadImageToS3,
} from "@/services/api";

function Profile() {
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhoto, setNewPhoto] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        console.log("📦 Loaded userId:", userId);

        if (!userId) {
          console.error("❌ No user ID in localStorage");
          return;
        }

        const users = await fetchUserFromDB();
        console.log("📄 All users from DB:", users);

        const matchedUser = users.find(
          (u) =>
            String(u._id) === String(userId) || String(u.id) === String(userId)
        );

        if (!matchedUser) {
          console.error("❌ User not found in DB");
          return;
        }

        setUser(matchedUser);
        setNewName(matchedUser.userName || "");
        setNewPhoto(matchedUser.profileImageUrl || "");

        const booksData = await fetchBooksFromDB(
          matchedUser._id || matchedUser.id
        );
        setBooks(booksData);
      } catch (err) {
        console.error("⚠️ Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    const userId = user?._id || user?.id;

    if (!userId) {
      return console.error("❌ User ID is missing!");
    }

    const updatedUser = {
      userName: newName,
      profileImageUrl: newPhoto,
    };

    try {
      const response = await updateUserInDB(userId, updatedUser);
      setUser(response);
      setEditMode(false);
    } catch (err) {
      console.error("⚠️ Error updating user:", err);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const imageUrl = await uploadImageToS3(file);
        setNewPhoto(imageUrl);
      } catch (err) {
        console.error("⚠️ Image upload failed:", err);
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    const first = parts[0]?.[0] || "";
    const last = parts[1]?.[0] || "";
    return (first + last).toUpperCase();
  };

  if (loading) {
    return <div className="text-center p-10 text-lg">Loading Profile...</div>;
  }

  const readCount = books.filter((b) => b.status === "Reading").length;
  const unreadCount = books.filter((b) => b.status === "Unread").length;
  const completedCount = books.filter((b) => b.status === "Completed").length;

  const displayImage = editMode ? newPhoto : user?.profileImageUrl || "";

  return (
    <div className="container mx-auto p-6">
      {/* Profile header */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
        {displayImage ? (
          <img
            src={displayImage}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border"
          />
        ) : (
          <div className="w-20 h-20 rounded-full flex items-center justify-center bg-black text-3xl font-bold text-white border">
            {getInitials(user?.userName)}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {editMode ? (
            <>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border p-2 rounded"
                placeholder="Enter your name"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{user?.userName}'s Profile</h2>
              <button
                onClick={() => setEditMode(true)}
                className="text-blue-600 text-sm hover:underline"
              >
                ✏️ Edit Profile
              </button>
            </>
          )}
        </div>
      </div>

      {/* Book stats */}
      <div className="flex justify-around text-lg font-medium bg-gray-100 rounded-lg p-4 shadow-md">
        <div className="text-blue-600">📘 Unread: {unreadCount}</div>
        <div className="text-yellow-600">📖 Reading: {readCount}</div>
        <div className="text-green-600">✅ Completed: {completedCount}</div>
      </div>
    </div>
  );
}

export default Profile;
