import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../services/api";

const BASE_URL = import.meta.env.VITE_BASE_URL_BACKEND;

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
};

export const registerUser = createAsyncThunk(
  "/auth/register",
  async (formData) => {
    const response = await axios.post(`${BASE_URL}/auth/register`, formData, {
      withCredentials: true,
    });

    return response.data;
  }
);

export const loginUser = createAsyncThunk(
  "/auth/login",
  async (formData, thunkAPI) => {
    try {
      const response = await api.post("/auth/login", formData);
      const { success, user, token, status, message } = response.data;

      if (!success && status == 0) {
        // 🚨 User is not verified - OTP flow
        return thunkAPI.rejectWithValue({
          type: "UNVERIFIED_USER",
          message,
          userId: response.data.id,
        });
      }

      // ✅ Check both `id` and `_id`
      const userId = user?.id || user?._id;

      if (success && userId) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userId", userId); // ✅ Correct value stored
        console.log("✅ Stored userId:", userId);
        return response.data;
      }

      return thunkAPI.rejectWithValue({
        type: "INVALID_CREDENTIALS",
        message: "Login failed. Invalid credentials.",
      });
    } catch (error) {
      return thunkAPI.rejectWithValue({
        type: "SERVER_ERROR",
        message: error?.response?.data?.message || "Server error",
      });
    }
  }
);

export const logoutUser = createAsyncThunk("/auth/logout", async () => {
  const response = await axios.post(
    `${BASE_URL}/auth/logout`,
    {},
    {
      withCredentials: true,
    }
  );

  localStorage.clear();

  return response.data;
});

export const checkAuth = createAsyncThunk("/auth/checkauth", async (token) => {
  console.log(token);
  // if(!localStorage.getItem("token"))
  // {
  //   token=null;
  // }
  // if(token!=null && localStorage.getItem(token))
  // {
  //   token=null;
  // }
  // if(token==null)
  // {
  //   token=localStorage.getItem('token');
  //   console.log("token is updated");
  //   console.log("token is ",token);
  // }
  token = localStorage.getItem("token");
  const response = await axios.get(`${BASE_URL}/auth/check-auth`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });

  return response.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {},
    resetTokenAndCredentials: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // .addCase(registerUser.pending, (state) => {
      //   state.isLoading = true;
      // })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      // .addCase(loginUser.pending, (state) => {
      //   state.isLoading = true;
      // })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log(action);

        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
        state.token = action.payload.token;
        sessionStorage.setItem("token", JSON.stringify(action.payload.token));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
        console.log(action.payload);
        // if(action.payload.token==undefined || action.payload.token==false)
        // {
        // if(localStorage.getItem("token")!=null || localStorage.getItem("token")!=undefined)
        // {
        //   sessionStorage.setItem("token",localStorage.getItem("token"));
        // }
        // }
        // sessionStorage.setItem("token", JSON.stringify(action.payload.token));
        sessionStorage.setItem("token", localStorage.getItem("token"));
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        localStorage.clear();
        sessionStorage.removeItem("token");
        sessionStorage.clear();
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        localStorage.clear();
        sessionStorage.clear();
      });
  },
});

export const { setUser, resetTokenAndCredentials } = authSlice.actions;
export default authSlice.reducer;
