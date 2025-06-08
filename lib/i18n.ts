import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  lng: "ko",
  fallbackLng: "ko",
  debug: false,
  interpolation: {
    escapeValue: false, // react escapes by default
  },
  resources: {
    ko: {
      translation: require("../public/locales/ko.json"),
    },
    ja: {
      translation: require("../public/locales/ja.json"),
    },
    en: {
      translation: require("../public/locales/en.json"),
    },
  },
});

export default i18n;
