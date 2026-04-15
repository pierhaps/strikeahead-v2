import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import StatBar from '../components/dashboard/StatBar';
import RingProgress from '../components/dashboard/RingProgress';

const tideEase = [0.2, 0.8, 0.2, 1];

const ranges = ['Woche', 'Monat', 'Jahr', 'Total'];

const rangeData = {
  Woche:  { catches: 12, kg: 18.4, arten: 5,  bars: [2,0,4,1,3,0,2], max: 4 },
  Monat:  { catches: 47, kg: 74.2, arten: 11, bars: [8,3,12,5,7,4,8], max: 12 },
  Jahr:   { catches: 284, kg: 447, arten: 19, bars: [35,40,52,48,60,30,19], max: 60 },
  Total:  { catches: 142, kg: 218, arten: 24, bars: [18,22,28,20,25,15,14], max: 28 },
};

const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

const pbCards = [
  { species: 'Hecht', icon: '🎣', record: '96 cm', sub: '7.2 kg · Schweriner See' },
  { species: 'Zander', icon: '🐟', record: '8.2 kg', sub: '74 cm · Bodden' },
  { species: 'Barsch', icon: '🐠', record: '41 cm', sub: '1.4 kg · Tollensesee' },
];

function AnimatedStat({ value, label, suffix = '' }) {
  return (
    <motion.div
      key={value}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: tideEase }}
      className="flex-1 glass-card rounded-2xl p-3 text-center"
    >
      <p className="font-display font-extrabold text-2xl text-gradient-tide leading-none">{value}{suffix}</p>
      <p className="text-foam/50 text-xs mt-1">{label}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const [activeRange, setActiveRange] = useState('Woche');
  const data = rangeData[activeRange];

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-5">
        <div>
          <p className="text-foam/50 text-sm">Deine Statistiken</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">Dashboard</h1>
        </div>

        {/* Range Selector */}
        <div className="glass-card rounded-2xl p-1 flex gap-1 relative">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRange(r)}
              className="flex-1 relative py-2 px-1 text-sm font-semibold rounded-xl transition-colors duration-200 z-10"
              style={{ color: activeRange === r ? '#021521' : 'rgba(234,248,250,0.5)' }}
            >
              {activeRange === r && (
                <motion.div
                  layoutId="range-indicator"
                  className="absolute inset-0 rounded-xl gradient-tide"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">{r}</span>
            </button>
          ))}
        </div>

        {/* Big Stats */}
        <div className="flex gap-2">
          <AnimatedStat value={data.catches} label="Fänge" />
          <AnimatedStat value={data.kg} label="kg" suffix=" kg" />
          <AnimatedStat value={data.arten} label="Arten" />
        </div>

        {/* Bar Chart */}
        <div className="glass-card rounded-3xl p-4">
          <p className="text-foam/50 text-xs uppercase tracking-widest mb-3">7 Tage Aktivität</p>
          <div className="flex items-end gap-1.5">
            {data.bars.map((v, i) => (
              <StatBar key={`${activeRange}-${i}`} day={days[i]} value={v} max={data.max} highlight={v === Math.max(...data.bars)} />
            ))}
          </div>
        </div>

        {/* Ring Progress */}
        <div className="glass-card rounded-3xl p-4">
          <p className="text-foam/50 text-xs uppercase tracking-widest mb-4">Ziele & Quoten</p>
          <div className="flex justify-around">
            <RingProgress label="Monatsziel" pct={78} color="tide" />
            <RingProgress label="Hit-Rate" pct={92} color="sun" />
          </div>
        </div>

        {/* PB Cards — sun-gradient record labels with glow */}
        <div>
          <p className="text-foam/50 text-xs uppercase tracking-widest mb-3">Persönliche Bestleistungen</p>
          <div className="space-y-2.5">
            {pbCards.map((pb, i) => (
              <motion.div
                key={pb.species}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07, ease: tideEase }}
                className="glass-card rounded-2xl p-4 flex items-center gap-4"
                style={{ borderColor: 'rgba(245,195,75,0.15)' }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(245,195,75,0.15), rgba(255,216,114,0.08))', border: '1px solid rgba(245,195,75,0.3)', boxShadow: '0 0 12px rgba(245,195,75,0.15)' }}>
                  {pb.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foam font-bold">{pb.species}</p>
                  <p className="text-foam/50 text-xs truncate">{pb.sub}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display font-extrabold text-xl text-sun-gradient">{pb.record}</p>
                  <p className="text-sun-400/40 text-xs font-medium">⭐ Rekord</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="h-4" />
      </div>
    </PageTransition>
  );
}