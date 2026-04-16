import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import OceanBackground from './OceanBackground';
import BottomNav from './BottomNav';
import AppDrawer from './AppDrawer';

/**
 * AppShell — Brand v3
 *  - Navy gradient surface (handled by OceanBackground)
 *  - Page transition: rise-fade, tide easing
 *  - Max-lg container w/ safe-area awareness
 *  - Burger button (top-right) opens AppDrawer with access to all 30+ pages
 */
export default function AppShell() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="relative min-h-dvh bg-navy-900 overflow-x-hidden text-mist">
      <OceanBackground />

      {/* Burger button — fixed top-right */}
      <button
        onClick={() => setDrawerOpen(true)}
        aria-label="Menu"
        className="fixed z-50 right-3 w-10 h-10 rounded-full flex items-center justify-center text-foam/80 hover:text-foam transition-all glass-strong border border-foam/10"
        style={{
          top: 'calc(env(safe-area-inset-top) + 0.5rem)',
          background: 'linear-gradient(180deg, rgba(10,24,40,0.85), rgba(2,21,43,0.75))',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        <Menu className="w-5 h-5" />
      </button>

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
