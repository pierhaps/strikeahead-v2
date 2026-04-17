import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const THRESHOLD = 72;   // px to pull before triggering
const MAX_PULL = 100;   // clamp

export default function PullToRefresh({ onRefresh, children }) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    const el = containerRef.current;
    if (!el) return;
    if (el.scrollTop > 0) return;          // only fire at very top
    startY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (startY.current === null || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy <= 0) { setPullY(0); return; }
    setPullY(Math.min(dy * 0.45, MAX_PULL));  // dampen
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (startY.current === null) return;
    startY.current = null;
    if (pullY >= THRESHOLD) {
      setRefreshing(true);
      setPullY(THRESHOLD * 0.7);
      await onRefresh?.();
      setRefreshing(false);
    }
    setPullY(0);
  }, [pullY, onRefresh]);

  const progress = Math.min(pullY / THRESHOLD, 1);

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ overscrollBehavior: 'none' }}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(pullY > 4 || refreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 flex justify-center z-20"
            style={{ height: pullY || (refreshing ? THRESHOLD * 0.7 : 0), pointerEvents: 'none' }}
          >
            <div className="flex items-center justify-center">
              <motion.div
                animate={{ rotate: refreshing ? 360 : 0 }}
                transition={refreshing
                  ? { repeat: Infinity, duration: 0.9, ease: 'linear' }
                  : { duration: 0 }
                }
                style={{ opacity: 0.3 + progress * 0.7 }}
              >
                {/* Fishing-themed wave spinner */}
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle
                    cx="14" cy="14" r="11"
                    stroke="url(#ptr-grad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.PI * 22 * progress} ${Math.PI * 22}`}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                  />
                  <defs>
                    <linearGradient id="ptr-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop stopColor="#2580C3" />
                      <stop offset="1" stopColor="#8BE752" />
                    </linearGradient>
                  </defs>
                  <text x="14" y="18" textAnchor="middle" fontSize="11" fill="#2EE0C9">🎣</text>
                </svg>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content shifted down while pulling */}
      <motion.div
        animate={{ y: pullY }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      >
        {children}
      </motion.div>
    </div>
  );
}