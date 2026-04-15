import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Fish, Anchor, Trophy, Users, ChevronRight, Zap, Target, Star } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';

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

const actionTiles = [
  { label: 'Fang loggen', sub: 'Neuen Fang eintragen', path: '/upload', gradient: 'gradient-tide glow-tide', icon: Fish },
  { label: 'Hotspots', sub: 'Beste Spots finden', path: '/map', gradient: 'bg-abyss-700 border border-tide-300/20', icon: Target },
  { label: 'Tide & Wetter', sub: 'Forecast anzeigen', path: '/tidecatch', gradient: 'bg-abyss-700 border border-tide-300/20', icon: Anchor },
  { label: 'Turniere', sub: 'Aktive Turniere', path: '/tournaments', gradient: 'bg-abyss-700 border border-tide-300/20', icon: Trophy },
];

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
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'Angler';
  const totalCatches = user?.total_catches ?? 142;
  const fishXp = user?.fish_xp ?? 3840;
  const hookPoints = user?.hook_points ?? 520;

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-foam/50 text-sm font-medium">Willkommen zurück</p>
            <h1 className="font-display text-3xl font-extrabold text-gradient-tide">
              Moin, {firstName} 🎣
            </h1>
          </div>
          <div className="w-11 h-11 rounded-2xl gradient-tide flex items-center justify-center glow-tide">
            <span className="text-xl">🐟</span>
          </div>
        </div>

        {/* Hero Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: tideEase }}
          className="glass-card rounded-3xl p-5"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-foam/50 text-xs uppercase tracking-widest font-medium mb-1">Fänge gesamt</p>
              <p className="font-display font-extrabold text-5xl text-gradient-sun">
                <AnimatedNumber value={totalCatches} />
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {/* Streak */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                style={{ background: 'rgba(245,195,75,0.12)', border: '1px solid rgba(245,195,75,0.25)' }}>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Flame className="w-4 h-4 text-sun-400" />
                </motion.div>
                <span className="text-sun-300 font-bold text-sm">7 Tage</span>
              </div>
              {/* Hook Points */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                style={{ background: 'rgba(31,167,184,0.12)', border: '1px solid rgba(31,167,184,0.25)' }}>
                <Anchor className="w-3.5 h-3.5 text-tide-400" />
                <span className="text-tide-300 font-bold text-sm"><AnimatedNumber value={hookPoints} /></span>
                <span className="text-tide-400/60 text-xs">HP</span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-foam/50">Fish XP</span>
              <span className="text-xs text-tide-300 font-semibold"><AnimatedNumber value={fishXp} /> XP</span>
            </div>
            <div className="h-2 rounded-full bg-abyss-700 overflow-hidden">
              <motion.div
                className="h-full rounded-full gradient-tide"
                initial={{ width: 0 }}
                animate={{ width: '73%' }}
                transition={{ duration: 1.2, delay: 0.3, ease: tideEase }}
              />
            </div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Arten', value: 24, icon: '🐠' },
              { label: 'Rekorde', value: 5, icon: '🏆' },
              { label: 'Rang', value: '#12', icon: '⚡' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-abyss-800/60 p-2.5 text-center">
                <div className="text-lg mb-0.5">{stat.icon}</div>
                <div className="font-display font-bold text-foam text-lg leading-none">{stat.value}</div>
                <div className="text-foam/40 text-[10px] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Tiles 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          {actionTiles.map((tile, i) => {
            const Icon = tile.icon;
            return (
              <motion.div
                key={tile.path}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07, ease: tideEase }}
              >
                <Link to={tile.path}>
                  <motion.div
                    whileTap={{ scale: 0.97 }}
                    className={`rounded-2xl p-4 h-24 flex flex-col justify-between ${tile.gradient}`}
                  >
                    <Icon className={`w-6 h-6 ${i === 0 ? 'text-white' : 'text-tide-400'}`} />
                    <div>
                      <p className="font-display font-bold text-white text-sm leading-tight">{tile.label}</p>
                      <p className={`text-xs ${i === 0 ? 'text-white/70' : 'text-foam/40'}`}>{tile.sub}</p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Catches */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-foam text-lg">Letzte Fänge</h2>
            <Link to="/mycatches" className="text-tide-400 text-sm flex items-center gap-1">
              Alle <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {recentCatches.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                className="relative flex-shrink-0 w-28 h-36 rounded-2xl overflow-hidden"
              >
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

        {/* Leaderboard Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: tideEase }}
          className="glass-card rounded-3xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-foam">Top Crews diese Woche</h2>
            <Link to="/leaderboard" className="text-tide-400 text-sm flex items-center gap-1">
              Alle <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {topCrews.map((crew, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold font-display ${
                  i === 0 ? 'bg-sun-400/20 text-sun-400' : 'bg-abyss-700 text-foam/50'
                }`}>
                  {crew.rank}
                </div>
                <div className="flex-1">
                  <p className="text-foam font-semibold text-sm">{crew.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-foam font-bold text-sm">{crew.points.toLocaleString('de-DE')}</p>
                  <p className="text-tide-400 text-xs">{crew.change}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer spacing */}
        <div className="h-4" />
      </div>
    </PageTransition>
  );
}