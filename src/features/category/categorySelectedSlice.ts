import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Category {
  _id: string;
  classification: string;
  name_ko: string;
  name_ja: string;
}

interface CategorySelectedState {
  selectedCategory: Category | null;
}

const initialState: CategorySelectedState = {
  selectedCategory: null,
};

export const categorySelectedSlice = createSlice({
  name: "categorySelected",
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
  },
});

export const { setSelectedCategory, clearSelectedCategory } =
  categorySelectedSlice.actions;

export default categorySelectedSlice.reducer;
