import React from 'react';
import { motion } from 'framer-motion';

export default function HpBalanceHeader({ balance }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-6 text-center relative overflow-hidden"
    >
      {/* Aurora bg */}
      <div className="absolute inset-0 aurora-layer opacity-40 pointer-events-none" />

      <p className="overline text-muted2 mb-1">Dein Guthaben</p>
      <div className="flex items-baseline justify-center gap-2">
        <span className="text-5xl font-black text-gradient-tide">
          {(balance || 0).toLocaleString('de-DE')}
        </span>
        <span className="text-xl font-bold text-foam/60">HP</span>
      </div>
      <p className="text-xs text-muted2 mt-2">🪝 HookPoints</p>
    </motion.div>
  );
}