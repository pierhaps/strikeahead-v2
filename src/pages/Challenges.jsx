import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import PageTransition from '../components/ui/PageTransition';

const TABS = [
  { key: 'daily', label: 'challenges_daily' },
  { key: 'weekly', label: 'challenges_weekly' },
  { key: 'special', label: 'challenges_special' },
  { key: 'eco', label: 'challenges_eco' },
];

function ProgressBar({ value, max }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 bg-abyss-700 rounded-full overflow-hidden">
      <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8 }} style={{ background: 'linear-gradient(90deg,#1FA7B8,#F5C34B)' }} />
    </div>
  );
}

export default function Challenges() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('daily');
  const [challenges, setChallenges] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([base44.auth.me(), base44.entities.Challenge.list('-created_date', 100)])
      .then(([u, cs]) => { setUser(u); setChallenges(cs); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = challenges.filter(c => c.type === tab && c.is_active);

  const getUserProgress = (ch) => {
    const entry = (ch.completions || []).find(c => c.user_email === user?.email);
    return entry?.progress || 0;
  };

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div>
          <p className="text-foam/50 text-sm">{t('community.challenges')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('community.challenges')}</h1>
        </div>

        <div className="glass-card rounded-2xl p-1 flex gap-1">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${tab === key ? 'gradient-tide text-white' : 'text-foam/50'}`}>
              {t(`community.${label}`)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16"><p className="text-5xl mb-4">⚡</p><p className="text-foam/50">{t('community.challenges_empty')}</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ch, i) => {
              const progress = getUserProgress(ch);
              const pct = Math.min((progress / ch.goal_target) * 100, 100);
              const completed = pct >= 100;
              return (
                <motion.div key={ch.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`glass-card rounded-2xl p-4 space-y-3 ${completed ? 'border border-sun-500/30' : ''}`}
                  style={completed ? { background: 'rgba(245,195,75,0.05)' } : {}}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      {ch.sponsor_brand && (
                        <span className="text-xs text-foam/30 mb-1 block">🏷 {ch.sponsor_brand}</span>
                      )}
                      <h3 className="text-foam font-bold">{ch.title}</h3>
                      {ch.description && <p className="text-foam/50 text-xs mt-0.5">{ch.description}</p>}
                    </div>
                    <div className="flex-shrink-0 px-3 py-1.5 rounded-xl text-center"
                      style={{ background: 'rgba(245,195,75,0.12)', border: '1px solid rgba(245,195,75,0.25)' }}>
                      <p className="text-sun-400 font-display font-bold text-sm">{ch.reward_points}</p>
                      <p className="text-sun-400/50 text-[10px]">HP</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foam/50">{t('community.challenges_progress')}</span>
                      <span className="text-foam font-semibold">{progress} / {ch.goal_target}</span>
                    </div>
                    <ProgressBar value={progress} max={ch.goal_target} />
                  </div>

                  {ch.end_date && (
                    <div className="flex items-center gap-1 text-foam/30 text-xs">
                      <Clock className="w-3 h-3" />
                      {new Date(ch.end_date).toLocaleDateString('de-DE')}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}