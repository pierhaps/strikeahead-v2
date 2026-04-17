import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TOTAL_SPECIES = 27;

function getDayName(lang, dayIndex) {
  const date = new Date();
  date.setDate(date.getDate() - date.getDay() + dayIndex);
  return date.toLocaleDateString(lang || 'de-DE', { weekday: 'long' });
}

function buildInsights(catches, lang) {
  const total = catches.length;
  const insights = [];

  // ── < 5 catches: species discovery ──────────────────────────────────
  if (total < 5) {
    const species = new Set(catches.map(c => c.species).filter(Boolean)).size;
    insights.push({
      key: 'species_discovery',
      icon: Sparkles,
      color: '#2EE0C9',
      de: `Artentdeckung: ${species} von ${TOTAL_SPECIES} Arten gefangen — weiter so!`,
      en: `Species discovery: ${species} of ${TOTAL_SPECIES} species caught — keep it up!`,
      progress: species / TOTAL_SPECIES,
    });
  }

  // ── 5-19 catches: pattern insights ──────────────────────────────────
  if (total >= 5 && total < 20) {
    // Best weekday
    const dayCounts = {};
    catches.forEach(c => {
      if (!c.caught_date) return;
      const d = new Date(c.caught_date).getDay();
      dayCounts[d] = (dayCounts[d] || 0) + 1;
    });
    const bestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
    if (bestDay) {
      const dayName = getDayName(lang, parseInt(bestDay[0]));
      insights.push({
        key: 'best_day',
        icon: Lightbulb,
        color: '#B6F03C',
        de: `Dein bester Tag war ${dayName} — ${bestDay[1]} Fänge`,
        en: `Your best day was ${dayName} — ${bestDay[1]} catches`,
      });
    }

    // Best time of day
    const todCounts = { morning: 0, midday: 0, afternoon: 0, evening: 0, night: 0 };
    catches.forEach(c => {
      if (!c.caught_time) return;
      const h = parseInt(c.caught_time.split(':')[0], 10);
      if (h >= 5 && h < 12) todCounts.morning++;
      else if (h >= 12 && h < 14) todCounts.midday++;
      else if (h >= 14 && h < 18) todCounts.afternoon++;
      else if (h >= 18 && h < 22) todCounts.evening++;
      else todCounts.night++;
    });
    const bestTod = Object.entries(todCounts).sort((a, b) => b[1] - a[1])[0];
    const TOD_LABEL = {
      de: { morning: 'Morgen', midday: 'Mittag', afternoon: 'Nachmittag', evening: 'Abend', night: 'Nacht' },
      en: { morning: 'morning', midday: 'midday', afternoon: 'afternoon', evening: 'evening', night: 'night' },
    };
    if (bestTod && bestTod[1] > 0) {
      const todLabel = (TOD_LABEL[lang] || TOD_LABEL.en)[bestTod[0]];
      insights.push({
        key: 'best_tod',
        icon: Lightbulb,
        color: '#2DA8FF',
        de: `Du fängst am meisten ${todLabel}s`,
        en: `You catch most fish in the ${todLabel}`,
      });
    }
  }

  // ── 20+ catches: regional comparison ────────────────────────────────
  if (total >= 20) {
    // Simulate a percentile based on catch count (in a real app, from backend)
    const percentile = Math.max(1, Math.min(25, Math.round(100 - (total / 2))));
    insights.push({
      key: 'regional',
      icon: Sparkles,
      color: '#B6F03C',
      de: `Du bist in den Top ${percentile}% der Angler in deiner Region`,
      en: `You're in the top ${percentile}% of anglers in your region`,
    });

    // Streak
    const sortedDates = catches
      .map(c => c.caught_date)
      .filter(Boolean)
      .sort()
      .reverse();
    if (sortedDates.length >= 2) {
      insights.push({
        key: 'streak',
        icon: Lightbulb,
        color: '#F5C34B',
        de: `${total} Fänge insgesamt — du bist auf einem guten Weg!`,
        en: `${total} total catches — you're on a roll!`,
      });
    }
  }

  // Fallback
  if (insights.length === 0) {
    insights.push({
      key: 'start',
      icon: Lightbulb,
      color: '#2EE0C9',
      de: 'Logge deinen ersten Fang und unlock persönliche Insights!',
      en: 'Log your first catch to unlock personal insights!',
    });
  }

  return insights;
}

export default function InsightBar({ catches }) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'de';

  const insights = useMemo(() => buildInsights(catches, lang), [catches, lang]);

  // Pick a rotating insight based on the current day (changes each session)
  const insight = useMemo(() => {
    const idx = new Date().getDate() % insights.length;
    return insights[idx];
  }, [insights]);

  const Icon = insight.icon;
  const text = insight[lang] || insight.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
      className="rounded-2xl px-4 py-3 flex items-start gap-3"
      style={{
        background: `linear-gradient(135deg, ${insight.color}10 0%, rgba(14,30,48,0.6) 100%)`,
        border: `1px solid ${insight.color}25`,
        backdropFilter: 'blur(16px)',
      }}
    >
      <motion.div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${insight.color}18`, border: `1px solid ${insight.color}30` }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Icon className="w-4 h-4" style={{ color: insight.color }} />
      </motion.div>

      <div className="flex-1 min-w-0">
        <p className="text-foam/80 text-sm leading-snug">{text}</p>
        {insight.progress !== undefined && (
          <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-foam/8">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${insight.color}, ${insight.color}80)` }}
              initial={{ width: 0 }}
              animate={{ width: `${insight.progress * 100}%` }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}