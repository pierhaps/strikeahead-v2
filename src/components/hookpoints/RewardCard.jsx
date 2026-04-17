import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Lock } from 'lucide-react';

const TYPE_LABELS = {
  temp_premium: 'Temporärer Zugang',
  single_use_feature: 'Einmalig nutzbar',
  cosmetic: 'Kosmetisch',
};

export default function RewardCard({ reward, userHp, onRedeem, redeeming }) {
  const canAfford = userHp >= reward.cost_hp;

  return (
    <motion.div
      whileHover={canAfford ? { scale: 1.02 } : {}}
      className={`relative rounded-2xl p-4 flex flex-col gap-3 glass-card border transition-all
        ${canAfford ? 'border-white/10' : 'border-white/4 opacity-60'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-2xl">{reward.icon}</div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/8 text-muted2">
          {TYPE_LABELS[reward.reward_type]}
        </span>
      </div>

      <div>
        <p className="font-bold text-foam text-sm leading-tight">{reward.name}</p>
        {reward.duration_hours && (
          <p className="text-xs text-muted2 mt-0.5">
            {reward.duration_hours >= 720
              ? '30 Tage'
              : reward.duration_hours >= 168
              ? '7 Tage'
              : `${reward.duration_hours}h`} Laufzeit
          </p>
        )}
      </div>

      <button
        onClick={() => canAfford && onRedeem(reward)}
        disabled={!canAfford || redeeming}
        className={`w-full py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all
          ${canAfford
            ? 'gradient-sun text-navy-900 hover:opacity-90'
            : 'bg-white/6 text-muted2 cursor-not-allowed'
          } disabled:opacity-50`}
      >
        {redeeming ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : !canAfford ? (
          <Lock className="w-3.5 h-3.5" />
        ) : null}
        {reward.cost_hp.toLocaleString()} HP
      </button>
    </motion.div>
  );
}