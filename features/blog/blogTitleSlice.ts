import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  initialTitle: "mogumogu",
  currentTitle: "",
};

export const blogTitleSlice = createSlice({
  name: "blogTitle",
  initialState,
  reducers: {
    setCurrentTitle: (state, action) => {
      state.currentTitle = action.payload;
    },
    resetTitle: (state) => {
      state.currentTitle = state.initialTitle;
    },
  },
});

export const { setCurrentTitle, resetTitle } = blogTitleSlice.actions;

export default blogTitleSlice.reducer;
