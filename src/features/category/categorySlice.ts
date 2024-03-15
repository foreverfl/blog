import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addClassification,
  updateClassification,
  deleteClassification,
  getClassificationsAndCategories,
} from "@/lib/mongodb";

// 비동기 액션 생성자
export const addClassificationAsync = createAsyncThunk(
  "category/addClassification",
  async ({ name_ko, name_ja }: { name_ko: string; name_ja: string }) => {
    const insertedId = await addClassification(name_ko, name_ja);
    return { _id: insertedId, name_ko, name_ja }; // 새로운 분류 정보를 반환
  }
);

export const fetchClassificationsAndCategories = createAsyncThunk(
  "category/fetchClassificationsAndCategories",
  async () => {
    const { classifications, categories } =
      await getClassificationsAndCategories();
    return { classifications, categories };
  }
);

export const updateClassificationAsync = createAsyncThunk(
  "category/updateClassification",
  async ({
    classificationId,
    name_ko,
    name_ja,
  }: {
    classificationId: string;
    name_ko: string;
    name_ja: string;
  }) => {
    const modifiedCount = await updateClassification(
      classificationId,
      name_ko,
      name_ja
    );
    return { classificationId, name_ko, name_ja, modifiedCount }; // 수정된 분류 정보 반환
  }
);

export const deleteClassificationAsync = createAsyncThunk(
  "category/deleteClassification",
  async (classificationId: string) => {
    const deletedCount = await deleteClassification(classificationId);
    return { classificationId, deletedCount }; // 삭제된 분류 정보 반환
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
    builder
      .addCase(fetchClassificationsAndCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClassificationsAndCategories.fulfilled, (state, action) => {
        state.classifications = action.payload.classifications;
        state.categories = action.payload.categories;
        state.loading = false;
      })
      .addCase(fetchClassificationsAndCategories.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addClassificationAsync.fulfilled, (state, action) => {
        state.classifications.push(action.payload);
      })
      .addCase(updateClassificationAsync.fulfilled, (state, action) => {
        const index = state.classifications.findIndex(
          (classification) =>
            classification._id === action.payload.classificationId
        );
        if (index !== -1) {
          state.classifications[index] = {
            ...state.classifications[index],
            ...action.payload,
          };
        }
      })
      .addCase(deleteClassificationAsync.fulfilled, (state, action) => {
        state.classifications = state.classifications.filter(
          (classification) =>
            classification._id !== action.payload.classificationId
        );
      });
  },
});

export default categorySlice.reducer;
