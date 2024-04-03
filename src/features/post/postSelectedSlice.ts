import { getPostByIndex, likePost, unlikePost } from "@/lib/mongodb";
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

// 좋아요 추가
export const likePostByUser = createAsyncThunk(
  "posts/likePost",
  async (
    { postId, userId }: { postId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const modifiedCount = await likePost(postId, userId);
      return { postId, userId, modifiedCount };
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 좋아요 취소
export const unlikePostByUser = createAsyncThunk(
  "posts/unlikePost",
  async (
    { postId, userId }: { postId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const modifiedCount = await unlikePost(postId, userId);
      return { postId, userId, modifiedCount };
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
  like: string[];
  createdAt: Date;
  updatedAt?: Date;
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
  reducers: {
    clearCurrentPost(state) {
      state.currentPost = null;
      state.selectedPostId = null;
      state.status = "idle";
      state.error = null;
    },
  },
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
      })
      .addCase(likePostByUser.fulfilled, (state, action) => {
        if (
          state.currentPost &&
          action.payload.postId === state.currentPost._id
        ) {
          // 좋아요 배열에 userId가 아직 없으면 추가
          const isLiked = state.currentPost.like.includes(
            action.payload.userId
          );
          if (!isLiked) {
            state.currentPost.like.push(action.payload.userId);
          }
        }
      })
      .addCase(unlikePostByUser.fulfilled, (state, action) => {
        if (
          state.currentPost &&
          action.payload.postId === state.currentPost._id
        ) {
          // 좋아요 배열에서 userId 제거
          const index = state.currentPost.like.indexOf(action.payload.userId);
          if (index > -1) {
            state.currentPost.like.splice(index, 1);
          }
        }
      });
  },
});

export const { clearCurrentPost } = postSelectedSlice.actions;

export default postSelectedSlice.reducer;
