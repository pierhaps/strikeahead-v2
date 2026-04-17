import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function PackageCard({ pkg, onBuy, buying }) {
  const bonusHp = Math.floor((pkg.hook_points * (pkg.bonus_percent || 0)) / 100);
  const totalHp = pkg.hook_points + bonusHp;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-2xl p-5 flex flex-col gap-3 cursor-pointer transition-all
        ${pkg.popular
          ? 'bg-gradient-to-br from-cyan2/20 to-tide-500/10 border-2 border-cyan2/60'
          : 'glass-card border border-white/8'
        }`}
    >
      {pkg.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan2 text-navy-900">
            ⭐ Beliebt
          </span>
        </div>
      )}

      <div className="text-3xl">{pkg.icon}</div>

      <div>
        <p className="font-bold text-foam text-base">{pkg.name}</p>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-2xl font-black text-gradient-tide">{totalHp.toLocaleString()}</span>
          <span className="text-muted2 text-sm">HP</span>
        </div>
        {bonusHp > 0 && (
          <span className="text-xs text-lime2 font-semibold">
            +{bonusHp} Bonus ({pkg.bonus_percent}%)
          </span>
        )}
      </div>

      <button
        onClick={() => onBuy(pkg)}
        disabled={buying}
        className={`mt-auto w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
          ${pkg.popular
            ? 'gradient-tide text-white glow-tide'
            : 'bg-white/10 hover:bg-white/15 text-foam border border-white/10'
          } disabled:opacity-50`}
      >
        {buying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {buying ? 'Wird geladen…' : `${pkg.price_eur.toFixed(2)} €`}
      </button>
    </motion.div>
  );
}