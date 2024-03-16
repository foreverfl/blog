import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PostSelectedState {
  selectedPostId: string | null;
}

const initialState: PostSelectedState = {
  selectedPostId: null,
};

export const postSelectedSlice = createSlice({
  name: "postSelected",
  initialState,
  reducers: {
    setSelectedPost: (state, action: PayloadAction<string | null>) => {
      state.selectedPostId = action.payload;
    },
    clearSelectedPost: (state) => {
      state.selectedPostId = null;
    },
  },
});

export const { setSelectedPost, clearSelectedPost } = postSelectedSlice.actions;

export default postSelectedSlice.reducer;
