import React from 'react';
import { motion } from 'framer-motion';

export default function RingProgress({ label, value, max, pct, color = 'tide' }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const strokeColor = color === 'sun' ? '#F5C34B' : '#1FA7B8';
  const glowColor = color === 'sun' ? 'rgba(245,195,75,0.4)' : 'rgba(31,167,184,0.35)';

  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(127,220,229,0.1)" strokeWidth="8" />
          <motion.circle
            cx="44" cy="44" r={r}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (circ * pct) / 100 }}
            transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1], delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-extrabold text-xl text-foam">{pct}%</span>
        </div>
      </div>
      <p className="text-foam/60 text-xs text-center font-medium leading-tight">{label}</p>
    </div>
  );
}