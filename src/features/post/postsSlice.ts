import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPosts, getPostsByCategory } from "@/lib/mongodb";

export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  const posts = await getPosts();
  return posts;
});

export const fetchPostsByCategory = createAsyncThunk(
  "posts/fetchPostsByCategory",
  async (categoryId: string) => {
    const posts = await getPostsByCategory(categoryId);
    return posts;
  }
);

interface PostsState {
  posts: any[];
  loading: boolean;
}

const initialState: PostsState = {
  posts: [],
  loading: false,
};

export const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.loading = false;
      })
      .addCase(fetchPostsByCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostsByCategory.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.loading = false;
      });
  },
});

export default postsSlice.reducer;
