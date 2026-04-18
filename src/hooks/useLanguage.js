import { useTranslation } from 'react-i18next';

/**
 * Returns { lang } — the two-letter language code currently active (e.g. 'de', 'en').
 */
export function useLanguageContext() {
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'de').split('-')[0];
  return { lang };
}