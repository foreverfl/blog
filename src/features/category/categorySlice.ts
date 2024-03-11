import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getClassificationsAndCategories } from "@/lib/mongodb";

// 비동기 액션 생성자
export const fetchClassificationsAndCategories = createAsyncThunk(
  "category/fetchClassificationsAndCategories",
  async () => {
    const { classifications, categories } =
      await getClassificationsAndCategories();
    return { classifications, categories };
  }
);

interface CategoryState {
  classifications: any[];
  categories: any[];
  loading: boolean;
}

const initialState: CategoryState = {
  classifications: [],
  categories: [],
  loading: false,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchClassificationsAndCategories.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      fetchClassificationsAndCategories.fulfilled,
      (
        state,
        action: PayloadAction<{ classifications: any[]; categories: any[] }>
      ) => {
        state.classifications = action.payload.classifications;
        state.categories = action.payload.categories;
        state.loading = false;
      }
    );
    builder.addCase(fetchClassificationsAndCategories.rejected, (state) => {
      state.loading = false;
    });
  },
});

export default categorySlice.reducer;
