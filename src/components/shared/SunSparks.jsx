import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Sparse sun-colored spark particles for micro-interactions.
 * Usage: <SunSparks active={showSparks} onComplete={() => setShowSparks(false)} />
 */
export default function SunSparks({ active, count = 5, originX = '50%', originY = '50%' }) {
  const sparks = Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i + Math.random() * 30 - 15,
    distance: 32 + Math.random() * 24,
    size: 3 + Math.random() * 3,
    delay: i * 0.04,
  }));

  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none absolute inset-0 overflow-visible" style={{ zIndex: 60 }}>
          {sparks.map((s) => {
            const rad = (s.angle * Math.PI) / 180;
            const tx = Math.cos(rad) * s.distance;
            const ty = Math.sin(rad) * s.distance;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0, 1, 0.8, 0], x: tx, y: ty }}
                exit={{}}
                transition={{ duration: 0.55, delay: s.delay, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  left: originX,
                  top: originY,
                  width: s.size,
                  height: s.size,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #FFE38F 0%, #F5C34B 100%)',
                  boxShadow: '0 0 4px rgba(245,195,75,0.8)',
                }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}