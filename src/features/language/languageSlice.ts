import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 초기 언어 설정을 로컬 스토리지 또는 브라우저 설정에서 가져오는 함수
const getInitialLanguage = () => {
  if (typeof window !== "undefined") {
    const savedLang = localStorage.getItem("siteLanguage");
    if (savedLang) return savedLang;

    const browserLang = navigator.language;
    return browserLang.startsWith("ko") ? "ko" : "ja";
  }
  return "ja";
};

export const languageSlice = createSlice({
  name: "language",
  initialState: {
    value: getInitialLanguage(),
  },
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("siteLanguage", action.payload); // 변경된 언어 설정을 로컬 스토리지에 저장
      }
    },
  },
});

export const { setLanguage } = languageSlice.actions;

export default languageSlice.reducer;
