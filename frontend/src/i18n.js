import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from './locales/en.json';
import translationSK from './locales/sk.json'

// the translations
const resources = {
  en: {
    translation: translationEN
  },
  sk: {
    translation: translationSK
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    keySeparator: false,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
