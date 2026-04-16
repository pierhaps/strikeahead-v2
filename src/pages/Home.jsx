import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame, Fish, Anchor, Trophy, Target, ChevronRight, Shield, Sparkles, Zap,
} from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';
import { computeTrustScore, aggregateTrust, trustMeta } from '../utils/trustEngine';
import { recommendBaits, getTimeOfDay, todaysHotSpecies } from '../utils/baitIntelligence';

const tideEase = [0.2, 0.8, 0.2, 1];

function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!Number.isFinite(value) || value <= 0) { setDisplay(0); return; }
    let start = 0;
    const step = Math.max(1, Math.ceil(value / 40));
    const timer = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplay(start);
      if (start >= value) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}{suffix}</span>;
}

// Compute streak: consecutive days with at least one catch, ending today or yesterday
function computeStreak(catches) {
  if (!catches?.length) return 0;
  const days = new Set();
  catches.forEach(c => {
    if (c.caught_date) {
      const d = String(c.caught_date).slice(0, 10);
      days.add(d);
    }
  });
  const dayKey = (d) => d.toISOString().slice(0, 10);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86400_000);

  let cursor;
  if (days.has(dayKey(today))) cursor = today;
  else if (days.has(dayKey(yesterday))) cursor = yesterday;
  else return 0;

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 86400_000);
  }
  return streak;
}

function TrustPill({ level, t }) {
  const meta = trustMeta[level] || trustMeta.unverified;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${meta.color} ${meta.border}`}
      style={{ background: 'rgba(2,21,33,0.55)' }}>
      <Shield className="w-2.5 h-2.5" />
      {t(meta.key)}
    </span>
  );
}

function CatchCard({ c, t }) {
  const { level } = computeTrustScore(c);
  const img = (c.photo_urls && c.photo_urls[0]) || null;
  const weight = c.weight_kg ? `${Number(c.weight_kg).toFixed(1)} kg` : (c.length_cm ? `${c.length_cm} cm` : '—');
  return (
    <Link to="/mycatches" className="flex-shrink-0">
      <div className="relative w-28 h-36 rounded-2xl overflow-hidden bg-abyss-700">
        {img ? (
          <img src={img} alt={c.species || t('common.unknown')} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🐟</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-abyss-950 via-abyss-950/30 to-transparent" />
        <div className="absolute top-1.5 right-1.5">
          <TrustPill level={level} t={t} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white font-bold text-xs truncate">{c.species || t('common.unknown')}</p>
          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
            style={{ background: 'rgba(245,195,75,0.85)', color: '#021521' }}>
            {weight}
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyCatches({ t }) {
  return (
    <Link to="/upload" className="block">
      <div className="glass-card rounded-2xl p-5 text-center">
        <div className="w-14 h-14 rounded-2xl gradient-tide mx-auto mb-3 flex items-center justify-center">
          <Fish className="w-7 h-7 text-white" />
        </div>
        <p className="font-display font-bold text-foam mb-1">{t('home.empty_catches_title')}</p>
        <p className="text-foam/50 text-sm mb-3">{t('home.empty_catches_sub')}</p>
        <span className="inline-flex items-center gap-1 text-tide-400 text-sm font-semibold">
          {t('home.empty_catches_cta')} <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}

function TipCard({ icon: Icon, title, body, cta, to }) {
  return (
    <Link to={to || '#'} className="block">
      <motion.div whileTap={{ scale: 0.98 }}
        className="glass-card rounded-2xl p-4 flex items-start gap-3"
        style={{ borderColor: 'rgba(245,195,75,0.2)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(245,195,75,0.2), rgba(31,167,184,0.15))' }}>
          <Icon className="w-5 h-5 text-sun-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-foam text-sm">{title}</p>
          <p className="text-foam/60 text-xs leading-snug mt-0.5">{body}</p>
          {cta && (
            <span className="inline-flex items-center gap-1 text-tide-400 text-xs font-semibold mt-1.5">
              {cta} <ChevronRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.Catch.list('-caught_date', 50).catch(() => []),
    ]).then(([u, list]) => {
      setUser(u);
      setCatches(Array.isArray(list) ? list : []);
      setLoading(false);
    });
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || t('home.defaultName');
  const totalCatches = catches.length;
  const fishXp = user?.fish_xp ?? totalCatches * 27;
  const hookPoints = user?.hook_points ?? totalCatches * 4;

  const streak = useMemo(() => computeStreak(catches), [catches]);
  const trust = useMemo(() => aggregateTrust(catches), [catches]);
  const speciesCount = useMemo(() => new Set(catches.map(c => c.species).filter(Boolean)).size, [catches]);
  const hotSpecies = useMemo(() => todaysHotSpecies(catches, 14), [catches]);
  const topSpecies = hotSpecies[0]?.species || null;

  const recentCatches = useMemo(() => catches.slice(0, 8), [catches]);

  const hour = new Date().getHours();
  const tod = getTimeOfDay(hour);
  const bait = useMemo(() => {
    if (!topSpecies) return null;
    return recommendBaits({ species: topSpecies, hour, weather: {} });
  }, [topSpecies, hour]);

  const nextLevelXp = useMemo(() => {
    const next = Math.ceil((fishXp + 1) / 1000) * 1000;
    const prev = Math.max(0, next - 1000);
    const pct = Math.max(5, Math.min(100, Math.round(((fishXp - prev) / (next - prev)) * 100)));
    return { next, pct };
  }, [fishXp]);

  const actionTiles = [
    { labelKey: 'home.tile_log',          subKey: 'home.tile_log_sub',          path: '/upload',      icon: Fish,   primary: true },
    { labelKey: 'home.tile_spots',        subKey: 'home.tile_spots_sub',        path: '/map',         icon: Target },
    { labelKey: 'home.tile_tide',         subKey: 'home.tile_tide_sub',         path: '/tidecatch',   icon: Anchor },
    { labelKey: 'home.tile_tournaments',  subKey: 'home.tile_tournaments_sub',  path: '/tournaments', icon: Trophy },
  ];

  const fmtNum = (n) => new Intl.NumberFormat(i18n.language).format(Math.round(n));

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-foam/50 text-sm font-medium">
              {t(`home.greet_${tod}`, { defaultValue: t('home.welcome_back') })}
            </p>
            <h1 className="font-display text-3xl font-extrabold text-gradient-tide truncate">
              {t('home.greeting', { name: firstName })}
            </h1>
          </div>
          <div className="w-11 h-11 rounded-2xl gradient-tide flex items-center justify-center flex-shrink-0 ml-2"
            style={{ boxShadow: '0 0 20px rgba(31,167,184,0.4), 0 0 8px rgba(245,195,75,0.25)' }}>
            <span className="text-xl">🐟</span>
          </div>
        </div>

        {/* Hero stat card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: tideEase }} className="glass-card rounded-3xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-foam/50 text-xs uppercase tracking-widest font-medium mb-1">
                {t('home.total_catches')}
              </p>
              <p className="font-display font-extrabold text-5xl text-gradient-sun">
                <AnimatedNumber value={totalCatches} />
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                style={{ background: 'rgba(245,195,75,0.12)', border: '1px solid rgba(245,195,75,0.3)', boxShadow: '0 0 10px rgba(245,195,75,0.12)' }}>
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Flame className="w-4 h-4 text-sun-400" />
                </motion.div>
                <span className="text-sun-gradient font-bold font-display text-sm">
                  {t('home.streak_days', { n: streak, count: streak })}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                style={{ background: 'rgba(245,195,75,0.1)', border: '1px solid rgba(245,195,75,0.22)' }}>
                <Anchor className="w-3.5 h-3.5 text-sun-400" />
                <span className="text-sun-gradient font-bold font-display text-sm">
                  <AnimatedNumber value={hookPoints} />
                </span>
                <span className="text-sun-400/50 text-xs">HP</span>
              </div>
            </div>
          </div>

          {/* XP bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-foam/50">Fish XP</span>
              <span className="text-xs text-sun-gradient font-semibold font-display">
                <AnimatedNumber value={fishXp} /> / {fmtNum(nextLevelXp.next)} XP
              </span>
            </div>
            <div className="h-2 rounded-full bg-abyss-700 overflow-hidden">
              <motion.div className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #1FA7B8 0%, #F5C34B 100%)' }}
                initial={{ width: 0 }}
                animate={{ width: `${nextLevelXp.pct}%` }}
                transition={{ duration: 1.2, delay: 0.3, ease: tideEase }} />
            </div>
          </div>

          {/* Micro stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl p-2.5 text-center bg-abyss-800/60">
              <div className="text-lg mb-0.5">🐠</div>
              <div className="font-display font-bold text-lg leading-none text-foam">{speciesCount}</div>
              <div className="text-foam/40 text-[10px] mt-0.5">{t('home.stat_species')}</div>
            </div>
            <div className="rounded-2xl p-2.5 text-center border border-sun-500/20"
              style={{ background: 'rgba(245,195,75,0.07)' }}>
              <div className="text-lg mb-0.5">🛡️</div>
              <div className="font-display font-bold text-lg leading-none text-sun-gradient">
                {trust.avgScore}
              </div>
              <div className="text-foam/40 text-[10px] mt-0.5">{t('home.stat_trust')}</div>
            </div>
            <div className="rounded-2xl p-2.5 text-center bg-abyss-800/60">
              <div className="text-lg mb-0.5">🏆</div>
              <div className="font-display font-bold text-lg leading-none text-foam">
                {trust.fullCount}
              </div>
              <div className="text-foam/40 text-[10px] mt-0.5">{t('home.stat_verified')}</div>
            </div>
          </div>
        </motion.div>

        {/* Action tiles */}
        <div className="grid grid-cols-2 gap-3">
          {actionTiles.map((tile, i) => {
            const Icon = tile.icon;
            return (
              <motion.div key={tile.path} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07, ease: tideEase }}>
                <Link to={tile.path}>
                  <motion.div whileTap={{ scale: 0.97 }}
                    className={`rounded-2xl p-4 h-24 flex flex-col justify-between ${tile.primary ? 'gradient-tide glow-tide' : 'bg-abyss-700 border border-tide-300/20'}`}>
                    <Icon className={`w-6 h-6 ${tile.primary ? 'text-white' : 'text-tide-400'}`} />
                    <div>
                      <p className="font-display font-bold text-white text-sm leading-tight">{t(tile.labelKey)}</p>
                      <p className={`text-xs ${tile.primary ? 'text-white/70' : 'text-foam/40'}`}>{t(tile.subKey)}</p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Bait Intelligence tip — only shown if we have enough data */}
        {bait && bait.baits && bait.baits.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: tideEase }}>
            <TipCard
              icon={Sparkles}
              title={t('home.bait_tip_title', { species: topSpecies })}
              body={t('home.bait_tip_body', {
                bait: bait.baits[0].name,
                tod: t(`home.tod_${tod}`, { defaultValue: tod }),
              })}
              cta={t('home.bait_tip_cta')}
              to="/baitcatalog"
            />
          </motion.div>
        )}

        {/* Recent catches */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-foam text-lg">{t('home.recent_catches')}</h2>
            {totalCatches > 0 && (
              <Link to="/mycatches" className="text-tide-400 text-sm flex items-center gap-1">
                {t('common.all')} <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
          {loading ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {[0, 1, 2].map(i => (
                <div key={`skel-${i}`} className="flex-shrink-0 w-28 h-36 rounded-2xl bg-abyss-800 animate-pulse" />
              ))}
            </div>
          ) : recentCatches.length === 0 ? (
            <EmptyCatches t={t} />
          ) : (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {recentCatches.map((c) => (
                <CatchCard key={c.id || `${c.species}-${c.caught_date}-${c.created_date}`} c={c} t={t} />
              ))}
            </div>
          )}
        </div>

        {/* Trust overview */}
        {totalCatches > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: tideEase }} className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-tide-400" />
                <h2 className="font-display font-bold text-foam">{t('home.trust_overview')}</h2>
              </div>
              <Link to="/statistics" className="text-tide-400 text-sm flex items-center gap-1">
                {t('common.details')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="font-display font-extrabold text-3xl text-gradient-tide leading-none">
                  {trust.avgScore}
                </p>
                <p className="text-foam/40 text-[10px] uppercase tracking-wider mt-1">{t('home.trust_avg')}</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[
                  { key: 'fully_verified', pct: trust.pct.full, color: 'bg-sun-400' },
                  { key: 'gps_verified', pct: trust.pct.gps, color: 'bg-tide-300' },
                  { key: 'photo_verified', pct: trust.pct.photo, color: 'bg-tide-400' },
                  { key: 'unverified', pct: trust.pct.unverified, color: 'bg-foam/20' },
                ].map(row => (
                  <div key={row.key} className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-abyss-800 overflow-hidden">
                      <motion.div className={`h-full rounded-full ${row.color}`}
                        initial={{ width: 0 }} animate={{ width: `${row.pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2, ease: tideEase }} />
                    </div>
                    <span className="text-foam/50 text-[10px] w-24 text-right">{t(`trust.${row.key}`)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Hot species band */}
        {hotSpecies.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: tideEase }} className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-sun-400" />
                <h2 className="font-display font-bold text-foam">{t('home.hot_species')}</h2>
              </div>
              <Link to="/fishencyclopedia" className="text-tide-400 text-sm flex items-center gap-1">
                {t('common.all')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {hotSpecies.slice(0, 6).map((s, i) => (
                <div key={s.species} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{
                    background: i === 0 ? 'rgba(245,195,75,0.12)' : 'rgba(31,167,184,0.08)',
                    border: i === 0 ? '1px solid rgba(245,195,75,0.3)' : '1px solid rgba(31,167,184,0.2)',
                  }}>
                  <span className="text-lg">{i === 0 ? '🔥' : '🐟'}</span>
                  <div>
                    <p className={`font-display font-bold text-sm ${i === 0 ? 'text-sun-gradient' : 'text-foam'}`}>
                      {s.species}
                    </p>
                    <p className="text-foam/40 text-[10px]">{t('home.hot_n', { n: s.count, count: s.count })}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="h-4" />
      </div>
    </PageTransition>
  );
}
