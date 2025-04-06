import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL_BACKEND;

// Create a base instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Keep this if you’re also using cookies
});

// ✅ Attach token from localStorage automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 📚 Fetch books uploaded by a specific user
export const fetchBooksFromDB = async (userId) => {
  try {
    const response = await api.get(
      userId ? `/books?userId=${userId}` : "/books"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
};

// 🔄 Update book status
export const updateBookStatus = async (bookId, newStatus) => {
  try {
    const response = await api.put(`/books/${bookId}/status`, {
      status: newStatus,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating book status:", error);
    throw error;
  }
};

// 📈 Update book progress, last page, total pages
export const updateBookProgress = async (bookId, data) => {
  try {
    const response = await api.put(`/books/${bookId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating book progress:", error);
    throw error;
  }
};

// 👤 Fetch user from backend
export const fetchUserFromDB = async () => {
  try {
    const response = await api.get("/user");
    console.log("User fetched from DB:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// 👤 Update user profile in backend
export const updateUserInDB = async (userId, updatedUserData) => {
  try {
    const response = await api.put(`/user/${userId}`, updatedUserData);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// 🖼️ Upload image to AWS S3 via backend route
export const uploadImageToS3 = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/user/upload", formData);
    return response.data.imageUrl;
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    throw error;
  }
};

// ✅ Default export for Axios instance
export default api;
