import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/ui/PageTransition';

const tideEase = [0.2, 0.8, 0.2, 1];

const CATEGORIES = [
  { id: 'basics', icon: '🎣', labelKey: 'angelschule.category_basics_label', color: '#1FA7B8', articles: [
    { titleKey: 'angelschule.article_basics_intro_title', durationKey: 'angelschule.lessons.equipment_beginner.duration', contentKey: 'Not in key yet - kept inline' },
    { titleKey: 'angelschule.article_basics_license_title', durationKey: 'angelschule.lessons.first_license.duration' },
    { title: 'Knoten für Anfänger', duration: '6 min', content: 'Die 3 wichtigsten Angelknoten...' },
  ]},
  { id: 'techniques', icon: '🎯', labelKey: 'angelschule.category_techniques_label', color: '#F5C34B', articles: [
    { title: 'Spinnfischen — Grundtechnik', duration: '10 min', content: 'Das Spinnfischen...' },
    { title: 'Grundangeln', duration: '7 min', content: 'Beim Grundangeln...' },
    { title: 'Fliegenfischen — Einführung', duration: '12 min', content: 'Fliegenfischen ist eine...' },
  ]},
  { id: 'knots', icon: '🪢', labelKey: 'angelschule.category_knots_label', color: '#4DC3D1', articles: [
    { title: 'Der Palomar-Knoten', duration: '3 min', content: 'Der Palomar-Knoten ist der zuverlässigste...' },
    { title: 'FG-Knoten (Braid-Fluoro)', duration: '5 min', content: 'Der FG-Knoten verbindet...' },
  ]},
  { id: 'equipment', icon: '⚙️', labelKey: 'angelschule.category_equipment_label', color: '#7FDCE5', articles: [
    { title: 'Ruten-Guide: Die richtige Wahl', duration: '9 min', content: 'Die Wahl der richtigen Rute...' },
    { title: 'Rollen richtig einstellen', duration: '6 min', content: 'Die Bremseinstellung deiner Rolle...' },
  ]},
  { id: 'weather', icon: '🌤️', labelKey: 'angelschule.category_weather_label', color: '#FFD872', articles: [
    { titleKey: 'angelschule.lessons.barometer_activity.title', durationKey: 'angelschule.lessons.barometer_activity.duration', contentKey: 'angelschule.article_reading_weather_body' },
    { title: 'Mondphasen beim Angeln', duration: '7 min', content: 'Solunartheorie: Während Voll- und Neumond...' },
  ]},
  { id: 'ethics', icon: '🌿', labelKey: 'angelschule.category_ethics_label', color: '#4DC3D1', articles: [
    { titleKey: 'angelschule.article_catch_release_title', durationKey: 'angelschule.lessons.catch_release.duration' },
    { titleKey: 'angelschule.article_clean_fishing_title', durationKey: 'angelschule.lessons.clean_fishing.duration' },
  ]},
];

function ArticleView({ article, category, onBack }) {
  const { t } = useTranslation();
  const title = article.titleKey ? t(article.titleKey) : article.title;
  const duration = article.durationKey ? t(article.durationKey) : article.duration;
  const content = article.contentKey ? t(article.contentKey) : article.content;
  const paragraphs = content.split('\n\n');
  
  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: tideEase }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-9 h-9 rounded-xl glass-card flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-foam/60" />
        </button>
        <div>
          <p className="text-foam/40 text-xs">{t(`community.${category.labelKey.split('.')[1]}`)}</p>
          <h2 className="font-display font-bold text-foam text-lg leading-tight">{title}</h2>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 mb-4 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-tide-400" />
        <span className="text-foam/60 text-sm">{duration} Lesezeit</span>
      </div>

      <div className="space-y-4">
        {paragraphs.map((para, i) => {
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
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4">
        <AnimatePresence mode="wait">
          {!selectedCat && !selectedArticle && (
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
                      <p className="text-foam/40 text-xs">{cat.articles.length} Artikel</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {selectedCat && !selectedArticle && (
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
                {selectedCat.articles.map((art, i) => {
                  const artTitle = art.titleKey ? t(art.titleKey) : art.title;
                  const artDuration = art.durationKey ? t(art.durationKey) : art.duration;
                  return (
                    <motion.button key={art.titleKey || art.title} onClick={() => setSelectedArticle(art)}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full glass-card rounded-2xl p-4 text-left flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                        style={{ background: `${selectedCat.color}18`, border: `1px solid ${selectedCat.color}30` }}>
                        {selectedCat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foam text-sm">{artTitle}</p>
                        <p className="text-foam/40 text-xs mt-0.5">{artDuration} Lesezeit</p>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-foam/30 rotate-180" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {selectedArticle && (
            <motion.div key="article-content">
              <ArticleView article={selectedArticle} category={selectedCat} onBack={() => setSelectedArticle(null)} />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="h-4" />
      </div>
    </PageTransition>
  );
}
