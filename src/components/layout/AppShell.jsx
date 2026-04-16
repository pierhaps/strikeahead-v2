import React, { useState, useRef, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import OceanBackground from './OceanBackground';
import BottomNav from './BottomNav';
import AppDrawer from './AppDrawer';

const EDGE_ZONE = 24;    // px from right edge to start swipe
const OPEN_THRESHOLD = 80; // px swipe distance to trigger open

/**
 * AppShell — iOS 26 Liquid Glass
 *  - Swipe from right edge opens AppDrawer (no hamburger button)
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
    // Must swipe left (from right edge) with more horizontal than vertical motion
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
