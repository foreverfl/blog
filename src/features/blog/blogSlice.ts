import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MainState {
  currentView: string;
  currentCategory: string | null; // 현재 선택된 카테고리
  postId: string | null; // 현재 보여줄 포스트의 ID
}

/*
- "main": 초기 상태(메인 화면)
- "adminCategoryManagement": 카테고리 관리(관리자)
- "adminPostList": 포스트 목록(관리자)
- "adminCreatePost": 포스트 작성(관리자)
- "userComments": 내 댓글 관리(사용자)
- "userPostList": 포스트 목록(사용자)
- "userPostDetail": 포스트 상세(사용자)
*/
const initialState: MainState = {
  currentView: "main", // 기본값은 포스트 목록
  currentCategory: null,
  postId: null,
};

const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    setCurrentView(
      state,
      action: PayloadAction<{
        view: string;
        category?: string;
        postId?: string;
      }>
    ) {
      const { view, category, postId } = action.payload;
      state.currentView = view;
      if (category !== undefined) {
        state.currentCategory = category;
      }

      if (postId !== undefined) {
        state.postId = postId;
      }
    },
    resetView(state) {
      state.currentView = "main";
      state.currentCategory = null;
      state.postId = null;
    },
  },
});

export const { setCurrentView, resetView } = mainSlice.actions;
export default mainSlice.reducer;
