import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import de from '../locales/de/common.json';
import en from '../locales/en/common.json';
import es from '../locales/es/common.json';
import fr from '../locales/fr/common.json';
import it from '../locales/it/common.json';
import hr from '../locales/hr/common.json';
import pt from '../locales/pt/common.json';
import nl from '../locales/nl/common.json';
import tr from '../locales/tr/common.json';
import el from '../locales/el/common.json';
import sq from '../locales/sq/common.json';
import ru from '../locales/ru/common.json';
import ar from '../locales/ar/common.json';
import sl from '../locales/sl/common.json';
import sr from '../locales/sr/common.json';
import no from '../locales/no/common.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: { common: de },
      en: { common: en },
      es: { common: es },
      fr: { common: fr },
      it: { common: it },
      hr: { common: hr },
      pt: { common: pt },
      nl: { common: nl },
      tr: { common: tr },
      el: { common: el },
      sq: { common: sq },
      ru: { common: ru },
      ar: { common: ar },
      sl: { common: sl },
      sr: { common: sr },
      no: { common: no },
    },
    defaultNS: 'common',
    fallbackLng: 'de',
    supportedLngs: ['de','en','es','fr','it','hr','pt','nl','tr','el','sq','ru','ar','sl','sr','no'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'strikeahead_lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;

// Alphabetical by label (Eigenbezeichnung)
export const LANGUAGES = [
  { code: 'ar', label: 'العربية',     flag: '🇸🇦' },
  { code: 'de', label: 'Deutsch',     flag: '🇩🇪' },
  { code: 'el', label: 'Ελληνικά',    flag: '🇬🇷' },
  { code: 'en', label: 'English',     flag: '🇬🇧' },
  { code: 'es', label: 'Español',     flag: '🇪🇸' },
  { code: 'fr', label: 'Français',    flag: '🇫🇷' },
  { code: 'hr', label: 'Hrvatski',    flag: '🇭🇷' },
  { code: 'it', label: 'Italiano',    flag: '🇮🇹' },
  { code: 'nl', label: 'Nederlands',  flag: '🇳🇱' },
  { code: 'no', label: 'Norsk',       flag: '🇳🇴' },
  { code: 'pt', label: 'Português',   flag: '🇵🇹' },
  { code: 'ru', label: 'Русский',     flag: '🇷🇺' },
  { code: 'sl', label: 'Slovenščina', flag: '🇸🇮' },
  { code: 'sq', label: 'Shqip',       flag: '🇦🇱' },
  { code: 'sr', label: 'Srpski',      flag: '🇷🇸' },
  { code: 'tr', label: 'Türkçe',      flag: '🇹🇷' },
];