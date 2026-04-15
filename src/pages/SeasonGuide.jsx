import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';

const tideEase = [0.2, 0.8, 0.2, 1];
const MONTH_NAMES = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

const ACTIVITY_CFG = {
  dormant: { label: 'Inaktiv', color: '#7FDCE5', bg: 'rgba(127,220,229,0.1)', bar: 10 },
  low: { label: 'Gering', color: '#4DC3D1', bg: 'rgba(77,195,209,0.12)', bar: 25 },
  moderate: { label: 'Moderat', color: '#F5C34B', bg: 'rgba(245,195,75,0.12)', bar: 55 },
  high: { label: 'Hoch', color: '#FFD872', bg: 'rgba(255,216,114,0.15)', bar: 80 },
  peak: { label: 'Peak 🔥', color: '#FF6B5B', bg: 'rgba(255,107,91,0.15)', bar: 100 },
};

const TIME_DE = { dawn: 'Morgendämmerung', morning: 'Morgen', midday: 'Mittag', afternoon: 'Nachmittag', dusk: 'Abendrot', night: 'Nacht', any: 'Ganztags' };

export default function SeasonGuide() {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12

  useEffect(() => {
    base44.entities.SeasonalPattern.list('species', 500).then(d => { setPatterns(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const forMonth = patterns
    .filter(p => p.month === month)
    .sort((a, b) => {
      const order = { peak: 5, high: 4, moderate: 3, low: 2, dormant: 1 };
      return (order[b.activity_level] || 0) - (order[a.activity_level] || 0);
    });

  if (loading) return <PageTransition><div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" /></div></PageTransition>;

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-5">
        <div>
          <p className="text-foam/50 text-sm">Monatsübersicht</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">Saisonkalender</h1>
        </div>

        {/* Month slider */}
        <div className="glass-card rounded-2xl p-3">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {MONTH_NAMES.map((m, i) => (
              <button key={m} onClick={() => setMonth(i + 1)}
                className={`flex-shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all ${month === i + 1 ? 'gradient-tide text-white glow-tide' : 'bg-abyss-700 text-foam/50'}`}>
                <span className="text-[10px] font-bold">{m}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <h2 className="font-display font-bold text-foam text-lg">{MONTH_NAMES[month - 1]}</h2>
          <span className="text-foam/40 text-sm">· {forMonth.length} Datensätze</span>
        </div>

        {forMonth.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center">
            <div className="text-5xl mb-4">📅</div>
            <p className="font-display font-bold text-foam">Keine Daten für diesen Monat</p>
            <p className="text-foam/40 text-sm mt-2">Saisondaten werden noch gesammelt</p>
          </div>
        ) : (
          <div className="space-y-3">
            {forMonth.map((p, i) => {
              const ac = ACTIVITY_CFG[p.activity_level] || ACTIVITY_CFG.low;
              return (
                <motion.div key={p.id || i}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, ease: tideEase }}
                  className="glass-card rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-display font-bold text-foam">{p.species}</p>
                      {p.region && <p className="text-foam/40 text-xs">{p.region}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold"
                        style={{ background: ac.bg, color: ac.color, border: `1px solid ${ac.color}33` }}>
                        {ac.label}
                      </span>
                      {p.spawning_period && (
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-coral-500/12 text-coral-500">Laichzeit ⚠️</span>
                      )}
                    </div>
                  </div>

                  {/* Activity bar */}
                  <div className="mb-3">
                    <div className="h-1.5 bg-abyss-700 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        style={{ background: ac.color }}
                        initial={{ width: 0 }} animate={{ width: `${ac.bar}%` }}
                        transition={{ duration: 0.7, delay: i * 0.05 }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {p.best_technique && (
                      <div className="glass-card rounded-lg p-2">
                        <p className="text-foam/40 text-[10px]">Technik</p>
                        <p className="text-foam font-semibold">{p.best_technique}</p>
                      </div>
                    )}
                    {p.best_time_of_day && (
                      <div className="glass-card rounded-lg p-2">
                        <p className="text-foam/40 text-[10px]">Beste Zeit</p>
                        <p className="text-foam font-semibold">{TIME_DE[p.best_time_of_day] || p.best_time_of_day}</p>
                      </div>
                    )}
                    {p.best_depth_m && (
                      <div className="glass-card rounded-lg p-2">
                        <p className="text-foam/40 text-[10px]">Tiefe</p>
                        <p className="text-foam font-semibold">{p.best_depth_m} m</p>
                      </div>
                    )}
                    {p.catch_probability != null && (
                      <div className="glass-card rounded-lg p-2">
                        <p className="text-foam/40 text-[10px]">Wahrsch.</p>
                        <p className="text-foam font-semibold">{p.catch_probability}%</p>
                      </div>
                    )}
                  </div>

                  {p.best_bait && <p className="text-foam/50 text-xs mt-2">🪝 {p.best_bait}</p>}
                  {p.notes && <p className="text-foam/40 text-xs mt-1 italic">{p.notes}</p>}
                </motion.div>
              );
            })}
          </div>
        )}
        <div className="h-4" />
      </div>
    </PageTransition>
  );
}