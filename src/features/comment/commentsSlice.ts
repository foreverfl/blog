import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addComment,
  getCommentsByPost,
  deleteComment,
  updateCommentContent,
  updateCommentWithAnswer,
  updateCommentAdminNotified,
  updateCommentUserNotified,
} from "@/lib/mongodb";

export const fetchCommentsByPost = createAsyncThunk(
  "comments/fetchByPost",
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await getCommentsByPost(postId);
      const comments = response.map((doc) => ({
        _id: doc._id.toString(),
        index: doc.index,
        user: doc.user.toString(),
        post: doc.post.toString(),
        lan: doc.lan,
        content: doc.content,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        adminNotified: doc.adminNotified,
        answer: doc.answer,
        answeredAt: doc.answeredAt ? doc.answeredAt.toISOString() : undefined,
        userNotified: doc.userNotified,
      }));
      return comments;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createComment = createAsyncThunk<
  Comment, // 반환 타입
  {
    postId: string;
    userId: string;
    content: string;
    lan: string;
  },
  // 추가 옵션
  {
    rejectValue: string;
  }
>(
  "comments/create",
  async ({ postId, userId, content, lan }, { rejectWithValue }) => {
    try {
      const commentFromDB = await addComment(postId, userId, content, lan);
      const result = {
        _id: commentFromDB._id.toString(),
        user: commentFromDB.user.toString(),
        post: commentFromDB.post.toString(),
        index: commentFromDB.index,
        content: commentFromDB.content,
        lan: commentFromDB.lan,
        createdAt: commentFromDB.createdAt.toISOString(),
        updatedAt: commentFromDB.updatedAt.toISOString(),
        adminNotified: commentFromDB.adminNotified,
      };
      return result;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue("An unknown error occurred");
      }
    }
  }
);

export const editComment = createAsyncThunk(
  "comments/updateContent",
  async (
    { commentId, content }: { commentId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const success = await updateCommentContent(commentId, content);
      if (success) {
        return commentId;
      } else {
        throw new Error("Failed to update content");
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  }
);

export const addAnswerToComment = createAsyncThunk(
  "comments/addAnswer",
  async (
    { commentId, answer }: { commentId: string; answer: string },
    { rejectWithValue }
  ) => {
    try {
      const success = await updateCommentWithAnswer(commentId, answer);
      if (success) {
        return commentId;
      } else {
        throw new Error("Failed to add answer");
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  }
);

export const updateAdminNotified = createAsyncThunk(
  "comments/updateAdminNotified",
  async (
    { commentId, adminNotified }: { commentId: string; adminNotified: boolean },
    { rejectWithValue }
  ) => {
    try {
      const success = await updateCommentAdminNotified(
        commentId,
        adminNotified
      );
      if (success) {
        return commentId;
      } else {
        throw new Error("Failed to update admin notified status");
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  }
);

export const updateUserNotified = createAsyncThunk(
  "comments/updateUserNotified",
  async (
    { commentId, userNotified }: { commentId: string; userNotified: boolean },
    { rejectWithValue }
  ) => {
    try {
      const success = await updateCommentUserNotified(commentId, userNotified);
      if (success) {
        return commentId;
      } else {
        throw new Error("Failed to update user notified status");
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  }
);

export const removeComment = createAsyncThunk(
  "comments/delete",
  async (commentId: string, { rejectWithValue }) => {
    try {
      const deletedCount = await deleteComment(commentId);
      if (deletedCount > 0) {
        return commentId;
      } else {
        throw new Error("Deletion failed");
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  }
);

interface Comment {
  _id: string;
  index: number;
  user: string;
  post: string;
  lan: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  adminNotified: boolean;
  answer?: string;
  answeredAt?: string;
  userNotified?: boolean;
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
      .addCase(fetchCommentsByPost.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.comments = action.payload;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.comments.push(action.payload);
      })
      .addCase(editComment.fulfilled, (state, action) => {
        const index = state.comments.findIndex(
          (comment) => comment._id === action.payload
        );
        if (index !== -1) {
          state.comments[index].content = action.meta.arg.content;
          state.comments[index].updatedAt = new Date().toISOString();
        }
      })
      .addCase(addAnswerToComment.fulfilled, (state, action) => {
        const index = state.comments.findIndex(
          (comment) => comment._id === action.payload
        );
        if (index !== -1) {
          state.comments[index].answer = action.meta.arg.answer;
          state.comments[index].answeredAt = new Date().toISOString();
          state.comments[index].userNotified = false;
        }
      })
      .addCase(updateAdminNotified.fulfilled, (state, action) => {
        const index = state.comments.findIndex(
          (comment) => comment._id === action.payload
        );
        if (index !== -1) {
          state.comments[index].adminNotified = action.meta.arg.adminNotified;
        }
      })
      .addCase(updateUserNotified.fulfilled, (state, action) => {
        const index = state.comments.findIndex(
          (comment) => comment._id === action.payload
        );
        if (index !== -1) {
          state.comments[index].userNotified = action.meta.arg.userNotified;
        }
      })
      // 댓글 삭제 성공
      .addCase(removeComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter(
          (comment) => comment._id !== action.payload
        );
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("comments/") &&
          action.type.endsWith("/rejected"),
        (state, action) => {
          state.status = "failed";
        }
      );
  },
});

export default commentsSlice.reducer;
