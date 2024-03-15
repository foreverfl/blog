import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const languageSlice = createSlice({
  name: "language",
  initialState: {
    value: "ja",
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
