import React from 'react';
import { motion } from 'framer-motion';

const tideEase = [0.2, 0.8, 0.2, 1];

export default function StatBar({ day, value, max, highlight }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <motion.div
        className="w-full rounded-t-lg overflow-hidden"
        style={{ height: '80px', display: 'flex', alignItems: 'flex-end' }}
      >
        <motion.div
          className={`w-full rounded-t-lg ${highlight ? 'bg-gradient-to-t from-sun-500 to-sun-300' : 'bg-gradient-to-t from-tide-500 to-tide-300'}`}
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ duration: 0.8, ease: tideEase, delay: 0.1 }}
          style={{ minHeight: value > 0 ? '4px' : '0' }}
        />
      </motion.div>
      <span className="text-[10px] text-foam/40 font-medium">{day}</span>
    </div>
  );
}