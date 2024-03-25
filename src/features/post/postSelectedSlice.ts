import { getPostByIndex } from "@/lib/mongodb";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export const fetchPostByIndex = createAsyncThunk(
  "posts/fetchByIndex",
  async (index: number, { rejectWithValue }) => {
    try {
      const response = await getPostByIndex(index);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

interface Post {
  _id: string;
  category: string;
  index: number;
  title_ko: string;
  title_ja: string;
  content_ko: string;
  content_ja: string;
  image: string;
  images: string[];
  like: number;
  createdAt: string; // ISO 문자열
}

interface PostSelectedState {
  currentPost: Post | null;
  selectedPostId: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null | undefined;
}

const initialState: PostSelectedState = {
  currentPost: null,
  selectedPostId: null,
  status: "idle",
  error: null,
};

export const postSelectedSlice = createSlice({
  name: "postSelected",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostByIndex.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPostByIndex.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentPost = action.payload;
      })
      .addCase(fetchPostByIndex.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default postSelectedSlice.reducer;
