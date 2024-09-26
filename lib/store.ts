import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/features/user/userSlice";
import postSelectedReducer from "@/features/post/postSelectedSlice";
import commentsReducer from "@/features/comment/commentsSlice";
import commentsUIReducer from "@/features/comment/commentsUISlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      postSelected: postSelectedReducer,
      comments: commentsReducer,
      commentsUI: commentsUIReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>; // getState 메서드는 Redux 스토어의 현재 상태를 반환하는 함수
export type AppDispatch = AppStore["dispatch"]; // dispatch 메서드는 액션을 스토어에 전달하는 역할
