import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ReferenceLine, Tooltip, ResponsiveContainer } from 'recharts';
import { Anchor, Clock, Fish } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/ui/PageTransition';

const tideEase = [0.2, 0.8, 0.2, 1];

const COAST_TYPES = [
  { key: 'nordsee', label: 'Nordsee', amplitude: 2.8, period: 12.4 },
  { key: 'ostsee', label: 'Ostsee', amplitude: 0.25, period: 24 },
  { key: 'atlantik', label: 'Atlantik', amplitude: 3.5, period: 12.4 },
  { key: 'mittelmeer', label: 'Mittelmeer', amplitude: 0.35, period: 24 },
];

function generateTideData(amplitude, periodH, offsetH = 0) {
  const points = [];
  for (let h = 0; h <= 24; h += 0.5) {
    const radians = ((h - offsetH) / periodH) * 2 * Math.PI;
    const height = amplitude * Math.sin(radians);
    points.push({
      time: h,
      label: `${String(Math.floor(h)).padStart(2, '0')}:${h % 1 === 0.5 ? '30' : '00'}`,
      height: parseFloat(height.toFixed(2)),
    });
  }
  return points;
}

function getOptimalWindows(data) {
  const windows = [];
  let prevDir = null;
  data.forEach((d, i) => {
    if (i === 0) { prevDir = Math.sign(d.height); return; }
    const dir = Math.sign(data[i].height);
    if (dir !== prevDir && prevDir !== 0) {
      const tideType = dir > 0 ? 'Flut' : 'Ebbe';
      const start = parseFloat((data[i - 1].time - 0.5).toFixed(1));
      const end = parseFloat((data[i].time + 0.5).toFixed(1));
      const fmt = h => `${String(Math.floor(h)).padStart(2, '0')}:${h % 1 === 0.5 ? '30' : '00'}`;
      windows.push({ type: tideType, label: `${fmt(start)} – ${fmt(end)}`, score: Math.floor(70 + Math.random() * 25) });
    }
    prevDir = dir;
  });
  return windows;
}

function TideTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs border border-tide-300/20">
      <p className="text-tide-400 font-bold">{payload[0].payload.label}</p>
      <p className="text-foam">{payload[0].value > 0 ? '+' : ''}{payload[0].value} m</p>
    </div>
  );
}

export default function TideCatch() {
  const [coast, setCoast] = useState('nordsee');
  const coastCfg = COAST_TYPES.find(c => c.key === coast) || COAST_TYPES[0];
  const tideData = generateTideData(coastCfg.amplitude, coastCfg.period, 3);
  const windows = getOptimalWindows(tideData);
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const currentTide = tideData.find(d => Math.abs(d.time - currentHour) < 0.3)?.height || 0;

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-5">
        <div>
          <p className="text-foam/50 text-sm">Gezeiten & Timing</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">Tide & Fang</h1>
        </div>

        {/* Coast selector */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {COAST_TYPES.map(c => (
            <button key={c.key} onClick={() => setCoast(c.key)}
              className={`px-4 py-2.5 rounded-2xl text-sm font-bold flex-shrink-0 transition-all ${coast === c.key ? 'gradient-tide text-white glow-tide' : 'glass-card text-foam/60'}`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Current status */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between"
          style={{ border: '1px solid rgba(31,167,184,0.2)' }}>
          <div>
            <p className="text-foam/40 text-xs uppercase tracking-widest">Aktuell</p>
            <p className="font-display font-extrabold text-foam text-2xl">{currentTide >= 0 ? '+' : ''}{currentTide.toFixed(2)} m</p>
            <p className="text-foam/50 text-xs">{currentTide >= 0 ? '↗ Flut steigt' : '↘ Ebbe fällt'}</p>
          </div>
          <div className="text-right">
            <Anchor className="w-8 h-8 text-tide-400 mb-1" />
            <p className="text-tide-400 text-xs font-bold">{coastCfg.label}</p>
          </div>
        </div>

        {/* Tide curve */}
        <div className="glass-card rounded-3xl p-4">
          <p className="font-display font-bold text-foam text-sm mb-4">24h Gezeiten-Kurve</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={tideData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tideGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1FA7B8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1FA7B8" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: 'rgba(234,248,250,0.3)', fontSize: 9 }} axisLine={false} tickLine={false}
                interval={7} />
              <YAxis tick={{ fill: 'rgba(234,248,250,0.3)', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TideTooltip />} />
              <ReferenceLine y={0} stroke="rgba(127,220,229,0.3)" strokeDasharray="4 4" />
              <ReferenceLine x={tideData.find(d => Math.abs(d.time - currentHour) < 0.6)?.label}
                stroke="#F5C34B" strokeWidth={2} label={{ value: 'Jetzt', fill: '#F5C34B', fontSize: 9 }} />
              <Area type="monotone" dataKey="height" stroke="#1FA7B8" strokeWidth={2.5}
                fill="url(#tideGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Optimal windows */}
        <div>
          <p className="text-foam/50 text-xs uppercase tracking-widest mb-3">Optimale Angelfenster</p>
          {windows.length === 0 ? (
            <div className="glass-card rounded-2xl p-6 text-center text-foam/40 text-sm">
              Keine Gezeitenwechsel für diese Küste
            </div>
          ) : (
            <div className="space-y-2">
              {windows.map((w, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="glass-card rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: w.type === 'Flut' ? 'rgba(31,167,184,0.15)' : 'rgba(245,195,75,0.12)' }}>
                    {w.type === 'Flut' ? '↗' : '↘'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-foam/40" />
                      <span className="text-foam font-semibold text-sm">{w.label}</span>
                    </div>
                    <p className="text-foam/40 text-xs mt-0.5">{w.type} · 30-60 Min. vor/nach Wechsel</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display font-bold text-sun-400 text-lg">{w.score}</p>
                    <p className="text-foam/30 text-[10px]">Score</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Info card */}
        <div className="glass-card rounded-2xl p-4 flex items-start gap-3"
          style={{ border: '1px solid rgba(245,195,75,0.15)' }}>
          <Fish className="w-5 h-5 text-sun-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-foam font-semibold text-sm mb-1">Warum Gezeitenwechsel?</p>
            <p className="text-foam/50 text-xs leading-relaxed">
              30–60 Minuten vor und nach dem Gezeitenwechsel sind Fische besonders aktiv. Die Strömungsänderung bringt Nahrung in Bewegung und stimuliert Raubfische.
            </p>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </PageTransition>
  );
}