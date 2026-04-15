import React from 'react';
import { motion } from 'framer-motion';
import { Waves } from 'lucide-react';
import PageTransition from '../ui/PageTransition';

export default function Placeholder({ title }) {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card rounded-3xl p-8 text-center max-w-sm w-full">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-tide flex items-center justify-center glow-tide"
          >
            <Waves className="w-8 h-8 text-white" />
          </motion.div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
            style={{ background: 'rgba(245,195,75,0.15)', color: '#F5C34B', border: '1px solid rgba(245,195,75,0.3)' }}>
            V2 Coming Soon
          </span>

          <h2 className="font-display text-2xl font-bold mb-2 text-gradient-tide">{title}</h2>
          <p className="text-foam/50 text-sm leading-relaxed">
            Diese Ansicht wird in der nächsten Version portiert.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}