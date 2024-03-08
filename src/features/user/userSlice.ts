import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 상태의 타입
interface UserState {
  userName: string | null;
  userId: string | null;
  email: string | null;
  photo: string | null;
  isLoggedOut: boolean;
}

// 상태의 초기 상태
const initialState: UserState = {
  userName: null,
  userId: null,
  email: null,
  photo: null,
  isLoggedOut: false,
};

// 슬라이스(Redux 상태 관리 로직)
const userSlice = createSlice({
  name: "user", // 슬라이스 이름
  initialState, // 슬라이스 초기 상태
  // 리듀서(상태를 업데이트 하는 함수)
  reducers: {
    loginSuccess(
      state,
      // 액션 객체의 타입을 정의하는 데 사용되는 제네릭 타입
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
