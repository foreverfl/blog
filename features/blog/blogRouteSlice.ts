import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BlogRouteState {
  previousLinks: string[];
  usedImages: string[];
}

const initialState: BlogRouteState = {
  previousLinks: [],
  usedImages: [],
};

const blogRouteSlice = createSlice({
  name: "blogRoute",
  initialState,
  reducers: {
    addPreviousLink: (state, action: PayloadAction<string>) => {
      const newLink = action.payload;
      if (state.previousLinks[state.previousLinks.length - 1] !== newLink) {
        state.previousLinks.push(newLink);

        if (state.previousLinks.length > 2) {
          state.previousLinks.shift(); // 배열의 첫 번째 요소를 제거
        }
      }
    },
    setUsedImages: (state, action: PayloadAction<string[]>) => {
      state.usedImages = action.payload;
    },
  },
});

export const { addPreviousLink, setUsedImages } = blogRouteSlice.actions;

export default blogRouteSlice.reducer;
