import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CommentsUIState {
  editingCommentId: string | null;
  replyingCommentId: string | null;
}

const initialState: CommentsUIState = {
  editingCommentId: null,
  replyingCommentId: null,
};

export const commentsUISlice = createSlice({
  name: "commentsUI",
  initialState,
  reducers: {
    // 댓글 수정 상태 설정
    setEditingCommentId: (state, action: PayloadAction<string | null>) => {
      state.editingCommentId = action.payload;
      state.replyingCommentId = null; // 댓글을 수정 상태로 설정할 때, 답변 상태는 해제
    },
    // 댓글 답변 상태 설정
    setReplyingCommentId: (state, action: PayloadAction<string | null>) => {
      state.replyingCommentId = action.payload;
      state.editingCommentId = null; // 댓글을 답변 상태로 설정할 때, 수정 상태는 해제
    },
    // 댓글 상태 초기화
    resetCommentUI: (state) => {
      state.editingCommentId = null;
      state.replyingCommentId = null;
    },
  },
});

export const { setEditingCommentId, setReplyingCommentId, resetCommentUI } =
  commentsUISlice.actions;

export default commentsUISlice.reducer;
