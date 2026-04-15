import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Fish, Anchor, Trophy, Target, ChevronRight } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';

const tideEase = [0.2, 0.8, 0.2, 1];

function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 40);
    const timer = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplay(start);
      if (start >= value) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}{suffix}</span>;
}

const recentCatches = [
  { species: 'Hecht', weight: '4.2 kg', img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&q=80' },
  { species: 'Zander', weight: '2.8 kg', img: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=200&q=80' },
  { species: 'Barsch', weight: '0.9 kg', img: 'https://images.unsplash.com/photo-1504173010664-32509107de26?w=200&q=80' },
];

const topCrews = [
  { rank: 1, name: 'Wattwurm FC', points: 1248, change: '+32' },
  { rank: 2, name: 'Tiefseejäger', points: 1192, change: '+18' },
  { rank: 3, name: 'Hafenratten', points: 1089, change: '+9' },
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || t('home.defaultName');
  const totalCatches = user?.total_catches ?? 142;
  const fishXp = user?.fish_xp ?? 3840;
  const hookPoints = user?.hook_points ?? 520;

  const actionTiles = [
    { labelKey: 'home.tile_log', subKey: 'home.tile_log_sub', path: '/upload', gradient: 'gradient-tide glow-tide', icon: Fish },
    { labelKey: 'home.tile_spots', subKey: 'home.tile_spots_sub', path: '/map', gradient: 'bg-abyss-700 border border-tide-300/20', icon: Target },
    { labelKey: 'home.tile_tide', subKey: 'home.tile_tide_sub', path: '/tidecatch', gradient: 'bg-abyss-700 border border-tide-300/20', icon: Anchor },
    { labelKey: 'home.tile_tournaments', subKey: 'home.tile_tournaments_sub', path: '/tournaments', gradient: 'bg-abyss-700 border border-tide-300/20', icon: Trophy },
  ];

  const fmtNum = (n) => new Intl.NumberFormat(i18n.language).format(n);

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-foam/50 text-sm font-medium">{t('home.welcome_back')}</p>
            <h1 className="font-display text-3xl font-extrabold text-gradient-tide">
              {t('home.greeting', { name: firstName })} 🎣
            </h1>
          </div>
          <div className="w-11 h-11 rounded-2xl gradient-tide flex items-center justify-center"
            style={{ boxShadow: '0 0 20px rgba(31,167,184,0.4), 0 0 8px rgba(245,195,75,0.25)' }}>
            <span className="text-xl">🐟</span>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: tideEase }} className="glass-card rounded-3xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-foam/50 text-xs uppercase tracking-widest font-medium mb-1">{t('home.total_catches')}</p>
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
                <span className="text-sun-gradient font-bold font-display text-sm">{t('home.streak_days', { n: 7 })}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                style={{ background: 'rgba(245,195,75,0.1)', border: '1px solid rgba(245,195,75,0.22)' }}>
                <Anchor className="w-3.5 h-3.5 text-sun-400" />
                <span className="text-sun-gradient font-bold font-display text-sm"><AnimatedNumber value={hookPoints} /></span>
                <span className="text-sun-400/50 text-xs">HP</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-foam/50">Fish XP</span>
              <span className="text-xs text-sun-gradient font-semibold font-display"><AnimatedNumber value={fishXp} /> XP</span>
            </div>
            <div className="h-2 rounded-full bg-abyss-700 overflow-hidden">
              <motion.div className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #1FA7B8 0%, #F5C34B 100%)' }}
                initial={{ width: 0 }} animate={{ width: '73%' }}
                transition={{ duration: 1.2, delay: 0.3, ease: tideEase }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { labelKey: 'home.stat_species', value: 24, icon: '🐠', sun: false },
              { labelKey: 'home.stat_records', value: 5, icon: '🏆', sun: true },
              { labelKey: 'home.stat_rank', value: '#12', icon: '⚡', sun: false },
            ].map((stat) => (
              <div key={stat.labelKey} className={`rounded-2xl p-2.5 text-center ${stat.sun ? 'border border-sun-500/20' : 'bg-abyss-800/60'}`}
                style={stat.sun ? { background: 'rgba(245,195,75,0.07)' } : {}}>
                <div className="text-lg mb-0.5">{stat.icon}</div>
                <div className={`font-display font-bold text-lg leading-none ${stat.sun ? 'text-sun-gradient' : 'text-foam'}`}>{stat.value}</div>
                <div className="text-foam/40 text-[10px] mt-0.5">{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {actionTiles.map((tile, i) => {
            const Icon = tile.icon;
            return (
              <motion.div key={tile.path} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07, ease: tideEase }}>
                <Link to={tile.path}>
                  <motion.div whileTap={{ scale: 0.97 }}
                    className={`rounded-2xl p-4 h-24 flex flex-col justify-between ${tile.gradient}`}>
                    <Icon className={`w-6 h-6 ${i === 0 ? 'text-white' : 'text-tide-400'}`} />
                    <div>
                      <p className="font-display font-bold text-white text-sm leading-tight">{t(tile.labelKey)}</p>
                      <p className={`text-xs ${i === 0 ? 'text-white/70' : 'text-foam/40'}`}>{t(tile.subKey)}</p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-foam text-lg">{t('home.recent_catches')}</h2>
            <Link to="/mycatches" className="text-tide-400 text-sm flex items-center gap-1">
              {t('common.all')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {recentCatches.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                className="relative flex-shrink-0 w-28 h-36 rounded-2xl overflow-hidden">
                <img src={c.img} alt={c.species} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-abyss-950 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white font-bold text-xs">{c.species}</p>
                  <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                    style={{ background: 'rgba(245,195,75,0.85)', color: '#021521' }}>
                    {c.weight}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: tideEase }} className="glass-card rounded-3xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-foam">{t('home.top_crews')}</h2>
            <Link to="/leaderboard" className="text-tide-400 text-sm flex items-center gap-1">
              {t('common.all')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {topCrews.map((crew, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold font-display ${
                  i === 0 ? 'bg-sun-400/20 text-sun-400' : 'bg-abyss-700 text-foam/50'}`}>
                  {crew.rank}
                </div>
                <div className="flex-1">
                  <p className="text-foam font-semibold text-sm">{crew.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-foam font-bold text-sm">{fmtNum(crew.points)}</p>
                  <p className="text-tide-400 text-xs">{crew.change}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="h-4" />
      </div>
    </PageTransition>
  );
}