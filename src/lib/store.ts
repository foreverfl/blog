import { configureStore } from "@reduxjs/toolkit";
import languageReducer from "@/features/language/languageSlice";
import userReducer from "@/features/user/userSlice";
import blogReducer from "@/features/blog/blogSlice";
import blogTitleReducer from "@/features/blog/blogTitleSlice";
import categoryReducer from "@/features/category/categorySlice";
import categorySelectedReducer from "@/features/category/categorySelectedSlice";
import postsReducer from "@/features/post/postsSlice";
import postSelectedReducer from "@/features/post/postSelectedSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      language: languageReducer,
      user: userReducer,
      blog: blogReducer,
      blogTitle: blogTitleReducer,
      category: categoryReducer,
      categorySelected: categorySelectedReducer,
      posts: postsReducer,
      postSelected: postSelectedReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>; // getState 메서드는 Redux 스토어의 현재 상태를 반환하는 함수
export type AppDispatch = AppStore["dispatch"]; // dispatch 메서드는 액션을 스토어에 전달하는 역할
