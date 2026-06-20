import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ko from "../src/locales/ko.json";
import ja from "../src/locales/ja.json";
import en from "../src/locales/en.json";

i18n.use(initReactI18next).init({
  lng: "ko",
  fallbackLng: "ko",
  debug: false,
  interpolation: {
    escapeValue: false, // react escapes by default
  },
  resources: {
    ko: { translation: ko },
    ja: { translation: ja },
    en: { translation: en },
  },
});

export default i18n;
