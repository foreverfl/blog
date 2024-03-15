import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addClassification,
  updateClassification,
  deleteClassification,
  getClassificationsAndCategories,
  addCategory,
  updateCategory,
  deleteCategory,
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

export const addCategoryAsync = createAsyncThunk(
  "category/addCategory",
  async ({
    classificationId,
    name_ko,
    name_ja,
  }: {
    classificationId: string;
    name_ko: string;
    name_ja: string;
  }) => {
    const insertedId = await addCategory(classificationId, name_ko, name_ja);
    return {
      _id: insertedId,
      classification: classificationId,
      name_ko,
      name_ja,
    };
  }
);

export const updateCategoryAsync = createAsyncThunk(
  "category/updateCategory",
  async ({
    categoryId,
    name_ko,
    name_ja,
  }: {
    categoryId: string;
    name_ko: string;
    name_ja: string;
  }) => {
    const modifiedCount = await updateCategory(categoryId, name_ko, name_ja);
    return { categoryId, name_ko, name_ja, modifiedCount };
  }
);

export const deleteCategoryAsync = createAsyncThunk(
  "category/deleteCategory",
  async (categoryId: string) => {
    const deletedCount = await deleteCategory(categoryId);
    return { categoryId, deletedCount };
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
      // Classification
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
      })
      // Category
      .addCase(addCategoryAsync.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateCategoryAsync.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (category) => category._id === action.payload.categoryId
        );
        if (index !== -1) {
          state.categories[index] = {
            ...state.categories[index],
            ...action.payload,
          };
        }
      })
      .addCase(deleteCategoryAsync.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (category) => category._id !== action.payload.categoryId
        );
      });
  },
});

export default categorySlice.reducer;
