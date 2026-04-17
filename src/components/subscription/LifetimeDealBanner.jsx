import React from 'react';
import { motion } from 'framer-motion';
import { Infinity, Zap } from 'lucide-react';

const TIER_COLORS = {
  1: { bg: 'rgba(182,240,60,0.12)', border: 'rgba(182,240,60,0.40)', text: '#B6F03C', badge: 'bg-lime2/20 text-lime2' },
  2: { bg: 'rgba(46,224,201,0.12)', border: 'rgba(46,224,201,0.40)', text: '#2EE0C9', badge: 'bg-teal2/20 text-teal2' },
  3: { bg: 'rgba(45,168,255,0.12)', border: 'rgba(45,168,255,0.40)', text: '#2DA8FF', badge: 'bg-cyan2/20 text-cyan2' },
  4: { bg: 'rgba(255,140,122,0.12)', border: 'rgba(255,140,122,0.35)', text: '#FF8C7A', badge: 'bg-coral-400/20 text-coral-400' },
};

export default function LifetimeDealBanner({ activeTier, onBuy, loading }) {
  if (!activeTier) return null;

  const colors = TIER_COLORS[activeTier.tier] || TIER_COLORS[1];
  const pct = Math.min(100, Math.round(((activeTier.sold || 0) / activeTier.max_slots) * 100));
  const remaining = activeTier.max_slots - (activeTier.sold || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 space-y-3"
      style={{ background: colors.bg, border: `1.5px solid ${colors.border}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${colors.border}30` }}>
            <Infinity className="w-5 h-5" style={{ color: colors.text }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-display font-extrabold text-foam text-base">Lifetime Deal</span>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${colors.badge}`}>
                Tier {activeTier.tier} – {activeTier.tier_name}
              </span>
            </div>
            <p className="text-foam/50 text-xs mt-0.5">Legend access forever · einmalige Zahlung</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-display font-extrabold text-xl" style={{ color: colors.text }}>€{activeTier.price}</p>
          <p className="text-foam/40 text-[10px]">einmalig</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-foam/50">{activeTier.sold || 0} von {activeTier.max_slots} Plätzen vergeben</span>
          <span className="font-bold" style={{ color: colors.text }}>{remaining} übrig</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: colors.text }}
          />
        </div>
      </div>

      <button
        onClick={onBuy}
        disabled={loading || remaining <= 0}
        className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ background: colors.border, color: '#0A1828' }}
      >
        <Zap className="w-4 h-4" />
        {remaining <= 0 ? 'Ausverkauft' : loading ? '…' : `Jetzt sichern – €${activeTier.price}`}
      </button>
    </motion.div>
  );
}