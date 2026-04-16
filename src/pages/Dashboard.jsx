import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import StatBar from '../components/dashboard/StatBar';
import RingProgress from '../components/dashboard/RingProgress';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { computeTrustScore } from '../utils/trustEngine';
import { Link } from 'react-router-dom';

const tideEase = [0.2, 0.8, 0.2, 1];
const RANGE_KEYS = ['week', 'month', 'year', 'total'];
const SPECIES_ICONS = {
  Hecht: '🐊', Zander: '🐟', Barsch: '🐠', Karpfen: '🎣',
  Bachforelle: '🦈', Regenbogenforelle: '🐡', Wels: '🐋',
  Aal: '🐍', Dorsch: '🐟', Makrele: '🐟', Thunfisch: '🐬',
  Wolfsbarsch: '🌊', Lachs: '🐟', Saibling: '❄️', Hering: '🐟',
  Scholle: '🐠', Seezunge: '🐠', Goldbrasse: '✨', Seehecht: '🐟',
  Rotbarbe: '🐠', Brasse: '🐟', Schleie: '🐟', Bonito: '🐟', Barrakuda: '🦈',
};

function AnimatedStat({ value, label, suffix = '' }) {
  return (
    <motion.div key={`${label}-${value}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: tideEase }}
      className="flex-1 glass-card rounded-2xl p-3 text-center">
      <p className="font-display font-extrabold text-2xl text-gradient-tide leading-none">
        {value}{suffix}
      </p>
      <p className="text-foam/50 text-xs mt-1">{label}</p>
    </motion.div>
  );
}

// --- stat computation helpers ---------------------------------------------

function toDate(c) {
  const d = c.caught_date ? new Date(c.caught_date) : (c.created_date ? new Date(c.created_date) : null);
  return d && !isNaN(d) ? d : null;
}

function inRange(range, d, now) {
  if (!d) return false;
  const diffMs = now - d;
  const day = 86400000;
  if (range === 'week') return diffMs >= 0 && diffMs <= 7 * day;
  if (range === 'month') return diffMs >= 0 && diffMs <= 31 * day;
  if (range === 'year') return diffMs >= 0 && diffMs <= 366 * day;
  return true; // total
}

function computeRangeStats(catches, range, now) {
  const filtered = catches.filter(c => inRange(range, toDate(c), now));
  const kg = filtered.reduce((s, c) => s + (Number(c.weight_kg) || 0), 0);
  const species = new Set(filtered.map(c => c.species).filter(Boolean));

  // 7-bucket bar chart — buckets depend on range
  const bars = new Array(7).fill(0);
  const labelKeys = new Array(7).fill('');

  if (range === 'week') {
    // 7 days ending today (Mon..Sun style: use last 7 calendar days)
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const idx = 6 - i;
      bars[idx] = filtered.filter(c => {
        const d = toDate(c);
        return d && d >= dayStart && d < dayEnd;
      }).length;
      const wk = ['day_su','day_mo','day_tu','day_we','day_th','day_fr','day_sa'][dayStart.getDay()];
      labelKeys[idx] = `common.${wk}`;
    }
  } else if (range === 'month') {
    // 7 weeks (ending this week)
    for (let i = 6; i >= 0; i--) {
      const end = new Date(now); end.setHours(23, 59, 59, 999);
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end); start.setDate(start.getDate() - 7);
      const idx = 6 - i;
      bars[idx] = catches.filter(c => { const d = toDate(c); return d && d > start && d <= end; }).length;
      labelKeys[idx] = `W-${i}`;
    }
  } else if (range === 'year') {
    // 7 months (most recent 7)
    const months = ['month_jan','month_feb','month_mar','month_apr','month_may','month_jun','month_jul','month_aug','month_sep','month_oct','month_nov','month_dec'];
    for (let i = 6; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const idx = 6 - i;
      bars[idx] = catches.filter(c => { const d = toDate(c); return d && d >= m && d < next; }).length;
      labelKeys[idx] = `common.${months[m.getMonth()]}`;
    }
  } else {
    // total — last 7 years
    const currentYear = now.getFullYear();
    for (let i = 6; i >= 0; i--) {
      const y = currentYear - i;
      const start = new Date(y, 0, 1);
      const end = new Date(y + 1, 0, 1);
      const idx = 6 - i;
      bars[idx] = catches.filter(c => { const d = toDate(c); return d && d >= start && d < end; }).length;
      labelKeys[idx] = String(y).slice(-2);
    }
  }

  const max = Math.max(1, ...bars);
  return {
    catches: filtered.length,
    kg: Math.round(kg * 10) / 10,
    arten: species.size,
    bars,
    labelKeys,
    max,
  };
}

function personalBests(catches) {
  const bySpecies = {};
  for (const c of catches) {
    if (!c.species) continue;
    const w = Number(c.weight_kg) || 0;
    const l = Number(c.length_cm) || 0;
    const cur = bySpecies[c.species];
    const score = w * 100 + l;
    if (!cur || score > cur.score) {
      bySpecies[c.species] = {
        species: c.species, weight: w, length: l,
        waterbody: c.waterbody || '',
        score,
      };
    }
  }
  return Object.values(bySpecies)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function hitRate(catches) {
  if (!catches.length) return 0;
  let verified = 0;
  for (const c of catches) {
    const { score } = computeTrustScore(c);
    if (score >= 60) verified++;
  }
  return Math.round((100 * verified) / catches.length);
}

function goalProgress(catches, goal = 30) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = catches.filter(c => {
    const d = toDate(c);
    return d && d >= startOfMonth;
  }).length;
  return Math.min(100, Math.round((100 * thisMonth) / goal));
}

// --- main component -------------------------------------------------------

export default function Dashboard() {
  const { t } = useTranslation();
  const [activeRange, setActiveRange] = useState('week');
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Catch.list('-caught_date', 500)
      .then(data => { setCatches(data || []); setLoading(false); })
      .catch(() => { setCatches([]); setLoading(false); });
  }, []);

  const now = useMemo(() => new Date(), []);
  const data = useMemo(() => computeRangeStats(catches, activeRange, now), [catches, activeRange, now]);
  const pbs = useMemo(() => personalBests(catches), [catches]);
  const hitPct = useMemo(() => hitRate(catches), [catches]);
  const goalPct = useMemo(() => goalProgress(catches, 30), [catches]);

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </PageTransition>
    );
  }

  if (!catches.length) {
    return (
      <PageTransition>
        <div className="px-4 pt-6 pb-4 space-y-5">
          <div>
            <p className="text-foam/50 text-sm">{t('dashboard.subtitle')}</p>
            <h1 className="font-display text-2xl font-extrabold text-foam">{t('dashboard.title')}</h1>
          </div>
          <div className="glass-card rounded-3xl p-10 text-center">
            <div className="text-5xl mb-4">📊</div>
            <p className="font-display font-bold text-foam text-lg">{t('dashboard.empty_title')}</p>
            <p className="text-foam/40 text-sm mt-2 mb-6">{t('dashboard.empty_sub')}</p>
            <Link to="/upload" className="inline-block px-6 py-3 rounded-2xl gradient-tide text-white font-bold text-sm glow-tide">
              {t('dashboard.empty_cta')}
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-5">
        <div>
          <p className="text-foam/50 text-sm">{t('dashboard.subtitle')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('dashboard.title')}</h1>
        </div>

        <div className="glass-card rounded-2xl p-1 flex gap-1 relative">
          {RANGE_KEYS.map(r => (
            <button key={r} onClick={() => setActiveRange(r)}
              className="flex-1 relative py-2 px-1 text-sm font-semibold rounded-xl transition-colors duration-200 z-10"
              style={{ color: activeRange === r ? '#021521' : 'rgba(234,248,250,0.5)' }}>
              {activeRange === r && (
                <motion.div layoutId="range-indicator"
                  className="absolute inset-0 rounded-xl gradient-tide"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
              )}
              <span className="relative z-10">{t(`dashboard.range_${r}`)}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <AnimatedStat value={data.catches} label={t('home.total_catches')} />
          <AnimatedStat value={data.kg} label="kg" suffix=" kg" />
          <AnimatedStat value={data.arten} label={t('home.stat_species')} />
        </div>

        <div className="glass-card rounded-3xl p-4">
          <p className="text-foam/50 text-xs uppercase tracking-widest mb-3">
            {t(`dashboard.activity_${activeRange}`)}
          </p>
          <div className="flex items-end gap-1.5">
            {data.bars.map((v, i) => {
              const rawLabel = data.labelKeys[i];
              const label = rawLabel && rawLabel.startsWith('common.') ? t(rawLabel) : rawLabel;
              return (
                <StatBar key={`${activeRange}-${i}`} day={label} value={v} max={data.max}
                  highlight={v === Math.max(...data.bars) && v > 0} />
              );
            })}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-4">
          <p className="text-foam/50 text-xs uppercase tracking-widest mb-4">{t('dashboard.goals')}</p>
          <div className="flex justify-around">
            <RingProgress label={t('dashboard.monthly_goal')} pct={goalPct} color="tide" />
            <RingProgress label={t('dashboard.hit_rate')} pct={hitPct} color="sun" />
          </div>
        </div>

        <div>
          <p className="text-foam/50 text-xs uppercase tracking-widest mb-3">{t('dashboard.personal_bests')}</p>
          {pbs.length === 0 ? (
            <div className="glass-card rounded-2xl p-6 text-center">
              <p className="text-foam/50 text-sm">{t('dashboard.no_bests_yet')}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pbs.map((pb, i) => (
                <motion.div key={pb.species} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07, ease: tideEase }}
                  className="glass-card rounded-2xl p-4 flex items-center gap-4"
                  style={{ borderColor: 'rgba(245,195,75,0.15)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(245,195,75,0.15), rgba(255,216,114,0.08))',
                      border: '1px solid rgba(245,195,75,0.3)',
                      boxShadow: '0 0 12px rgba(245,195,75,0.15)',
                    }}>
                    {SPECIES_ICONS[pb.species] || '🎣'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foam font-bold">{pb.species}</p>
                    <p className="text-foam/50 text-xs truncate">
                      {pb.length > 0 ? `${pb.length} cm` : ''}
                      {pb.length > 0 && pb.waterbody ? ' · ' : ''}
                      {pb.waterbody}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display font-extrabold text-xl text-sun-gradient">
                      {pb.weight > 0 ? `${pb.weight} kg` : `${pb.length} cm`}
                    </p>
                    <p className="text-sun-400/40 text-xs font-medium">⭐ {t('dashboard.record')}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="h-4" />
      </div>
    </PageTransition>
  );
}
