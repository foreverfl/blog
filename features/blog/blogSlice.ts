import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MainState {
  currentView: string;
  currentCategory: string | null; // 현재 선택된 카테고리
  loading: boolean;
}

/*
- "main": 초기 상태(메인 화면)
- "adminCategoryManagement": 카테고리 관리(관리자)
- "adminCreatePost": 포스트 작성(관리자)
- "adminCommentList": 댓글 목록(관리자)
- "userComments": 내 댓글 관리(사용자)
- "userPostList": 포스트 목록(사용자)
- "userPostListSearch": 검색 후 포스트 목록(사용자)
*/
const initialState: MainState = {
  currentView: "main", // 기본값은 포스트 목록
  currentCategory: null,
  loading: false,
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
      }>
    ) {
      const { view, category } = action.payload;
      state.currentView = view;
      if (category !== undefined) {
        state.currentCategory = category;
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    resetView(state) {
      state.currentView = "main";
      state.currentCategory = null;
    },
  },
});

export const { setCurrentView, setLoading, resetView } = mainSlice.actions;
export default mainSlice.reducer;
