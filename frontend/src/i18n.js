import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ja from './locales/ja.json';

const storedLang = localStorage.getItem('lang');
const browserLang = typeof navigator !== 'undefined' ? navigator.language : '';

const initialLng =
  storedLang ||
  (browserLang.toLowerCase().startsWith('ja') ? 'ja' : 'en');

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ja: { translation: ja }
    },
    lng: initialLng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;

