import React from 'react';
import { motion } from 'framer-motion';

export default function BillingToggle({ cycle, onChange }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={() => onChange('monthly')}
        className={`text-sm font-semibold transition-colors ${cycle === 'monthly' ? 'text-foam' : 'text-foam/40'}`}
      >
        Monatlich
      </button>

      {/* Toggle pill */}
      <button
        onClick={() => onChange(cycle === 'monthly' ? 'annual' : 'monthly')}
        className="relative w-12 h-6 rounded-full transition-colors"
        style={{ background: cycle === 'annual' ? '#2DA8FF' : 'rgba(255,255,255,0.12)' }}
      >
        <motion.div
          animate={{ x: cycle === 'annual' ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
        />
      </button>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange('annual')}
          className={`text-sm font-semibold transition-colors ${cycle === 'annual' ? 'text-foam' : 'text-foam/40'}`}
        >
          Jährlich
        </button>
        {cycle === 'annual' && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-lime2/20 text-lime2"
          >
            2 Monate gratis
          </motion.span>
        )}
      </div>
    </div>
  );
}