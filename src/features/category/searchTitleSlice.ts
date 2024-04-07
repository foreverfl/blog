import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SearchTitleState {
  title: string;
}

const initialState: SearchTitleState = {
  title: "",
};

const searchTitleSlice = createSlice({
  name: "searchTitle",
  initialState,
  reducers: {
    setSearchTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
    },
    resetSearchTitle(state) {
      state.title = "";
    },
  },
});

export const { setSearchTitle, resetSearchTitle } = searchTitleSlice.actions;
export default searchTitleSlice.reducer;
