import React, { useState, useRef, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import OceanBackground from './OceanBackground';
import BottomNav from './BottomNav';
import AppDrawer from './AppDrawer';

const EDGE_ZONE = 24;    // px from right edge to start swipe
const OPEN_THRESHOLD = 80; // px swipe distance to trigger open

/**
 * AppShell — iOS 26 Liquid Glass
 *  - Menu pill (top-right) + swipe from right edge opens AppDrawer
 *  - Page transitions via AnimatePresence
 *  - Max-lg container w/ safe-area awareness
 */
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

      {/* Menu capsule — top-right, always visible */}
      <motion.button
        onClick={() => setDrawerOpen(true)}
        aria-label="Menu"
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.04 }}
        className="fixed flex items-center gap-1.5 justify-center"
        style={{
          zIndex: 9999,
          top: 'calc(env(safe-area-inset-top) + 0.75rem)',
          right: '0.875rem',
          height: 34,
          paddingLeft: 12,
          paddingRight: 12,
          borderRadius: 17,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
          backdropFilter: 'blur(40px) saturate(180%) brightness(1.1)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%) brightness(1.1)',
          border: '0.5px solid rgba(255,255,255,0.20)',
          boxShadow: '0 0.5px 0 0 rgba(255,255,255,0.25) inset, 0 8px 28px rgba(0,0,0,0.25)',
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

      <div
        className="relative z-10 max-w-lg mx-auto page-content"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
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
