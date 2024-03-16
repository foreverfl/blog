import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CategorySelectedState {
  selectedCategoryId: string | null;
}

const initialState: CategorySelectedState = {
  selectedCategoryId: null,
};

export const categorySelectedSlice = createSlice({
  name: "categorySelected",
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategoryId = action.payload;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategoryId = null;
    },
  },
});

export const { setSelectedCategory, clearSelectedCategory } =
  categorySelectedSlice.actions;

export default categorySelectedSlice.reducer;
