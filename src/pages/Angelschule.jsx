import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/ui/PageTransition';

const tideEase = [0.2, 0.8, 0.2, 1];

// Each article refers to 3 keys under angelschule.lessons.<slug>: title, duration, body
const buildCategories = () => [
  { id: 'basics', icon: '🎣', labelKey: 'angelschule.category_basics_label', color: '#1FA7B8', lessons: [
    'equipment_beginner',
    'first_license',
    'knots_beginner',
  ]},
  { id: 'techniques', icon: '🎯', labelKey: 'angelschule.category_techniques_label', color: '#F5C34B', lessons: [
    'spinning_basics',
    'bottom_fishing',
    'fly_fishing_intro',
  ]},
  { id: 'knots', icon: '🪢', labelKey: 'angelschule.category_knots_label', color: '#4DC3D1', lessons: [
    'palomar_knot',
    'fg_knot',
  ]},
  { id: 'equipment', icon: '⚙️', labelKey: 'angelschule.category_equipment_label', color: '#7FDCE5', lessons: [
    'rod_guide',
    'reel_setup',
  ]},
  { id: 'weather', icon: '🌤️', labelKey: 'angelschule.category_weather_label', color: '#FFD872', lessons: [
    'barometer_activity',
    'moon_phases',
  ]},
  { id: 'ethics', icon: '🌿', labelKey: 'angelschule.category_ethics_label', color: '#4DC3D1', lessons: [
    'catch_release',
    'clean_fishing',
  ]},
];

const CATEGORIES = buildCategories();

function ArticleView({ lessonSlug, category, onBack }) {
  const { t } = useTranslation();
  const title = t(`angelschule.lessons.${lessonSlug}.title`);
  const duration = t(`angelschule.lessons.${lessonSlug}.duration`);
  const content = t(`angelschule.lessons.${lessonSlug}.body`, { defaultValue: '' });
  const paragraphs = content ? content.split('\n\n') : [];

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: tideEase }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-9 h-9 rounded-xl glass-card flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-foam/60" />
        </button>
        <div>
          <p className="text-foam/40 text-xs">{t(category.labelKey)}</p>
          <h2 className="font-display font-bold text-foam text-lg leading-tight">{title}</h2>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 mb-4 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-tide-400" />
        <span className="text-foam/60 text-sm">{duration} {t('angelschule.reading_time')}</span>
      </div>

      <div className="space-y-4">
        {paragraphs.length === 0 ? (
          <p className="text-foam/50 text-sm italic">{t('angelschule.body_coming_soon')}</p>
        ) : paragraphs.map((para, i) => {
          if (para.startsWith('**') || para.startsWith('#')) {
            return <h3 key={i} className="font-display font-bold text-foam text-base">{para.replace(/\*\*/g, '').replace(/^#+\s/, '')}</h3>;
          }
          return <p key={i} className="text-foam/70 text-sm leading-relaxed whitespace-pre-line">{para}</p>;
        })}
      </div>
    </motion.div>
  );
}

export default function Angelschule() {
  const { t } = useTranslation();
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4">
        <AnimatePresence mode="wait">
          {!selectedCat && !selectedLesson && (
            <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-6">
                <p className="text-foam/50 text-sm">{t('angelschule.subtitle')}</p>
                <h1 className="font-display text-2xl font-extrabold text-foam">{t('angelschule.title')}</h1>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat, i) => (
                  <motion.button key={cat.id} onClick={() => setSelectedCat(cat)}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    whileTap={{ scale: 0.96 }}
                    className="glass-card rounded-2xl p-4 text-left h-28 flex flex-col justify-between"
                    style={{ borderColor: `${cat.color}22` }}>
                    <span className="text-3xl">{cat.icon}</span>
                    <div>
                      <p className="font-display font-bold text-foam text-sm">{t(cat.labelKey)}</p>
                      <p className="text-foam/40 text-xs">{t('angelschule.articles_count', { count: cat.lessons.length })}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {selectedCat && !selectedLesson && (
            <motion.div key="articles" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setSelectedCat(null)} className="w-9 h-9 rounded-xl glass-card flex items-center justify-center">
                  <ChevronLeft className="w-4 h-4 text-foam/60" />
                </button>
                <div>
                  <p className="text-foam/40 text-xs">{t('angelschule.title')}</p>
                  <h2 className="font-display font-bold text-foam text-xl">{selectedCat.icon} {t(selectedCat.labelKey)}</h2>
                </div>
              </div>
              <div className="space-y-3">
                {selectedCat.lessons.map((slug, i) => (
                  <motion.button key={slug} onClick={() => setSelectedLesson(slug)}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full glass-card rounded-2xl p-4 text-left flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                      style={{ background: `${selectedCat.color}18`, border: `1px solid ${selectedCat.color}30` }}>
                      {selectedCat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foam text-sm">{t(`angelschule.lessons.${slug}.title`)}</p>
                      <p className="text-foam/40 text-xs mt-0.5">{t(`angelschule.lessons.${slug}.duration`)} {t('angelschule.reading_time')}</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-foam/30 rotate-180" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {selectedLesson && (
            <motion.div key="article-content">
              <ArticleView lessonSlug={selectedLesson} category={selectedCat} onBack={() => setSelectedLesson(null)} />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="h-4" />
      </div>
    </PageTransition>
  );
}
