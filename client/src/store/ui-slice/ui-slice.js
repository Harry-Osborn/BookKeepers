import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isFullscreen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setFullscreen: (state, action) => {
      state.isFullscreen = action.payload;
    },
  },
});

export const { setFullscreen } = uiSlice.actions;
export default uiSlice.reducer;
