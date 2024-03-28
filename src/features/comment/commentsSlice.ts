import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const fetchCommentsByPost = createAsyncThunk(
  "comments/fetchByPost",
  async (postId: string) => {
    const response = await getCommentsByPost(postId);
    // MongoDB에서 받은 데이터를 Comment[] 타입으로 매핑
    const comments: Comment[] = response.map((doc) => ({
      _id: doc._id.toString(),
      index: doc.index,
      post: doc.post,
      user: doc.user,
      content: doc.content,
      lan: doc.lan,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
      adminNotified: doc.adminNotified,
      userNotified: doc.userNotified,
    }));
    return comments;
  }
);

export const createComment = createAsyncThunk(
  "comments/create",
  async ({
    postId,
    userId,
    content,
    lan,
  }: {
    postId: string;
    userId: string;
    content: string;
    lan: string;
  }) => {
    const commentFromDB = await addComment(postId, userId, content, lan);
    const result: Comment = {
      _id: commentFromDB._id.toString(),
      user: commentFromDB.user.toString(),
      post: commentFromDB.post.toString(),
      index: commentFromDB.index,
      content: commentFromDB.content,
      lan: commentFromDB.lan,
      createdAt: commentFromDB.createdAt,
      updatedAt: commentFromDB.updatedAt,
      adminNotified: commentFromDB.adminNotified,
      userNotified: commentFromDB.userNotified,
    };

    return result;
  }
);

export const editComment = createAsyncThunk(
  "comments/update",
  async ({
    commentId,
    content,
    adminNotified,
    userNotified,
  }: {
    commentId: string;
    content: string;
    adminNotified?: boolean;
    userNotified?: boolean;
  }) => {
    const modifiedCount = await updateComment(
      commentId,
      content,
      adminNotified,
      userNotified
    );
    // 수정된 댓글 정보를 반환하거나, modifiedCount를 활용하여 상태 업데이트
    return { commentId, content, adminNotified, userNotified, modifiedCount };
  }
);

export const removeComment = createAsyncThunk(
  "comments/delete",
  async (commentId: string) => {
    const deletedCount = await deleteComment(commentId);
    return { commentId, deletedCount };
  }
);

interface Comment {
  _id: string;
  index: number;
  post: string;
  user: string;
  content: string;
  lan: string;
  createdAt: Date;
  updatedAt: Date;
  adminNotified: boolean;
  userNotified: boolean;
}

interface CommentsState {
  comments: Comment[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CommentsState = {
  comments: [],
  status: "idle",
  error: null,
};

// Slice 정의
const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommentsByPost.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCommentsByPost.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.comments = action.payload;
      })
      .addCase(fetchCommentsByPost.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Could not fetch comments.";
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
      })
      .addCase(editComment.fulfilled, (state, action) => {
        const { commentId, content, adminNotified, userNotified } =
          action.payload;
        const existingComment = state.comments.find(
          (comment) => comment._id === commentId
        );
        if (existingComment) {
          existingComment.content = content;
          if (adminNotified !== undefined)
            existingComment.adminNotified = adminNotified;
          if (userNotified !== undefined)
            existingComment.userNotified = userNotified;
          // updatedAt는 서버에서 처리됩니다.
          // 여기서는 예시로만 포함시키며, 실제로는 서버 응답을 기반으로 업데이트해야 합니다.
          existingComment.updatedAt = new Date();
        }
      })
      .addCase(removeComment.fulfilled, (state, action) => {
        const { commentId } = action.payload;
        state.comments = state.comments.filter(
          (comment) => comment._id !== commentId
        );
      });
  },
});

export default commentsSlice.reducer;
