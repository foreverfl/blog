import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 액션 타입
interface UserState {
  userName: string | null;
  userId: string | null;
  email: string | null;
  photo: string | null;
  isLoggedOut: boolean;
}

const initialState: UserState = {
  userName: null,
  userId: null,
  email: null,
  photo: null,
  isLoggedOut: false,
};

// 액션 정의
export const initializeAuth = (userName: string | null) => ({
  type: "user/initializeAuth",
  payload: userName,
});

// 리듀서 함수
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess(
      state,
      action: PayloadAction<{
        userId: string;
        username: string;
        email: string;
        photo: string;
      }>
    ) {
      const { userId, username, email, photo } = action.payload;
      state.userName = username;
      state.userId = userId;
      state.email = email;
      state.photo = photo;
      state.isLoggedOut = false;
    },
    logout(state) {
      state.userName = null;
      state.userId = null;
      state.email = null;
      state.photo = null;
      state.isLoggedOut = true;
    },
  },
});

export const { loginSuccess, logout } = userSlice.actions; // 액션 생성자 함수 export
export default userSlice.reducer; // reducer 등록
