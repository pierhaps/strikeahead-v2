import React, { useState, useRef, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import OceanBackground from './OceanBackground';
import BottomNav from './BottomNav';
import AppDrawer from './AppDrawer';

const EDGE_ZONE = 24;
const OPEN_THRESHOLD = 80;

const CAPSULE_STYLE = {
  height: 34,
  paddingLeft: 12,
  paddingRight: 12,
  borderRadius: 17,
  background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
  backdropFilter: 'blur(40px) saturate(180%) brightness(1.1)',
  WebkitBackdropFilter: 'blur(40px) saturate(180%) brightness(1.1)',
  border: '0.5px solid rgba(255,255,255,0.20)',
  boxShadow: '0 0.5px 0 0 rgba(255,255,255,0.25) inset, 0 8px 28px rgba(0,0,0,0.25)',
};

export default function AppShell() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const touchRef = useRef({ startX: 0, startY: 0, isEdge: false });

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    const fromRight = window.innerWidth - touch.clientX;
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      isEdge: fromRight <= EDGE_ZONE,
    };
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!touchRef.current.isEdge) return;
    const touch = e.changedTouches[0];
    const deltaX = touchRef.current.startX - touch.clientX;
    const deltaY = Math.abs(touch.clientY - touchRef.current.startY);
    if (deltaX > OPEN_THRESHOLD && deltaX > deltaY) {
      setDrawerOpen(true);
    }
    touchRef.current.isEdge = false;
  }, []);

  return (
    <div
      className="relative min-h-dvh bg-navy-900 overflow-x-hidden text-mist"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <OceanBackground />

      {/* Animated menu capsule — morphs between ··· (open) and ✕ (close) */}
      <AnimatePresence mode="wait">
        {!drawerOpen ? (
          <motion.button
            key="menu-open"
            onClick={() => setDrawerOpen(true)}
            aria-label="Menu"
            whileTap={{ scale: 0.88 }}
            initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed flex items-center gap-1.5 justify-center"
            style={{
              zIndex: 9999,
              top: 'calc(env(safe-area-inset-top) + 0.75rem)',
              right: '0.875rem',
              ...CAPSULE_STYLE,
            }}
          >
            <motion.div
              className="flex gap-[3px]"
              animate={{ opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="w-[4px] h-[4px] rounded-full bg-white/70" />
              <span className="w-[4px] h-[4px] rounded-full bg-white/70" />
              <span className="w-[4px] h-[4px] rounded-full bg-white/70" />
            </motion.div>
          </motion.button>
        ) : (
          <motion.button
            key="menu-close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            whileTap={{ scale: 0.88 }}
            initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed flex items-center gap-1.5 justify-center"
            style={{
              zIndex: 9999,
              top: 'calc(env(safe-area-inset-top) + 0.75rem)',
              right: '0.875rem',
              ...CAPSULE_STYLE,
            }}
          >
            <X className="w-[15px] h-[15px] text-white/70" strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      <div
        className="relative z-10 max-w-lg mx-auto page-content"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav />

      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}