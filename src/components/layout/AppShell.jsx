import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import OceanBackground from './OceanBackground';
import BottomNav from './BottomNav';

/**
 * AppShell — Brand v3
 *  - Navy gradient surface (handled by OceanBackground)
 *  - Page transition: rise-fade, tide easing
 *  - Max-lg container w/ safe-area awareness
 */
export default function AppShell() {
  const location = useLocation();

  return (
    <div className="relative min-h-dvh bg-navy-900 overflow-x-hidden text-mist">
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
    </div>
  );
}
