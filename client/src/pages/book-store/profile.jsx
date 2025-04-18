import { useEffect, useState, useRef } from "react";
import {
  fetchBooksFromDB,
  fetchUserFromDB,
  UpdateprofileImage,
  updateUserInDB,
} from "@/services/api";
import { Link } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";

function Profile() {
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [editName, setEditName] = useState(false);
  const [editPhoto, setEditPhoto] = useState(false);
  const [newName, setNewName] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef();

  const fetchData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const user = await fetchUserFromDB();
      console.log("user is ",user);
      setUser(user);
      setPreviewPhoto(user.profileImageUrl || "");
      setNewName(user.name);
      const booksData = await fetchBooksFromDB(user._id || user.id);
      setBooks(booksData);
    } catch (err) {
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNameSave = async () => {
    console.log("user is agaiŋ̄",user);
    const userId = user?.name|| user?.name;
    console.log("clicked on the change name");
    if (!userId) return;
    console.log("clicked on the change name");

    try {
      await updateUserInDB(userId, { userName: newName });
      setEditName(false);
      fetchData();
    } catch (err) {
      console.error("Error updating name:", err);
    }
  };

  const handlePhotoSave = async () => {
    try {
      if (photoFile) {
        const imageUrl = await UpdateprofileImage(photoFile);
        setPreviewPhoto(imageUrl);
        setEditPhoto(false);
        fetchData();
      }
    } catch (err) {
      console.error("Error updating profile image:", err);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setPreviewPhoto(URL.createObjectURL(file));
      setPhotoFile(file);
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
    return <div className="text-center p-10 text-lg text-gray-300">Loading Profile...</div>;
  }

  const readCount = books.filter((b) => b.status === "Reading").length;
  const unreadCount = books.filter((b) => b.status === "Unread").length;
  const completedCount = books.filter((b) => b.status === "Completed").length;

  return (
    <div className="min-h-screen px-4 py-8 bg-transparent from-gray-950 to-gray-900 text-white">
      <div className="max-w-3xl mx-auto bg-transparent border border-gray-700 rounded-xl shadow-xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 relative">
          <div className="relative group">
            {previewPhoto ? (
              <img
                src={previewPhoto}
                alt="Profile Preview"
                className="w-32 h-32 object-cover rounded-full border-4 border-gray-600 shadow-md"
              />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gray-700 text-3xl font-bold">
                {getInitials(user?.name)}
              </div>
            )}
            <button
              className="absolute bottom-0 right-0 p-1 bg-black bg-opacity-60 rounded-full text-white hover:bg-opacity-90 hidden group-hover:block"
              onClick={() => setEditPhoto(true)}
            >
              <FiEdit2 />
            </button>
            {editPhoto && (
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  ref={fileInputRef}
                  className="text-sm text-gray-300"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handlePhotoSave}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {setEditPhoto(false);
                      fetchData()
                    }}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 relative group">
            {editName ? (
              <>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleNameSave}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditName(false)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold inline-block">
                  {user?.name}
                </h2>
                <button
                  onClick={() => setEditName(true)}
                  className="ml-2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100"
                >
                  <FiEdit2 />
                </button>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <Link to="/books/library">
            <div className="border-b-2 p-4 rounded shadow hover:bg-slate-900 hover:rounded-lg">
              <h3 className="text-lg font-semibold">Reading</h3>
              <p className="text-2xl mt-2">{readCount}</p>
            </div>
          </Link>
          <Link to="/books/library">
            <div className="border-b-2 p-4 rounded shadow hover:bg-slate-900 hover:rounded-lg">
              <h3 className="text-lg font-semibold">Unread</h3>
              <p className="text-2xl mt-2">{unreadCount}</p>
            </div>
          </Link>
          <Link to="/books/library">
            <div className="border-b-2 p-4 rounded shadow hover:bg-slate-900 hover:rounded-lg">
              <h3 className="text-lg font-semibold">Completed</h3>
              <p className="text-2xl mt-2">{completedCount}</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Profile;