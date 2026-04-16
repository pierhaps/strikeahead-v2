import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  de: { common: { analytics: { title: 'Analytics' }, common: { month_jan: 'Jan' } } }
};

await i18n.use(initReactI18next).init({
  resources,
  defaultNS: 'common',
  lng: 'de',
  fallbackLng: 'de',
});

// Simulate useTranslation('analytics') = getFixedT(null, 'analytics')
const tAnalytics = i18n.getFixedT(null, 'analytics');
console.log('tAnalytics("title"):', JSON.stringify(tAnalytics('title')));
console.log('tAnalytics("common.month_jan"):', JSON.stringify(tAnalytics('common.month_jan')));

// Simulate useTranslation() default
const tDefault = i18n.getFixedT(null, null);
console.log('tDefault("analytics.title"):', JSON.stringify(tDefault('analytics.title')));
console.log('tDefault("common.month_jan"):', JSON.stringify(tDefault('common.month_jan')));
