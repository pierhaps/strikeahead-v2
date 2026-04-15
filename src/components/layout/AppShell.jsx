import React from 'react';
import { Outlet } from 'react-router-dom';
import OceanBackground from './OceanBackground';
import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <div className="relative min-h-dvh bg-abyss-950 overflow-x-hidden">
      <OceanBackground />
      <div className="relative z-10 max-w-lg mx-auto page-content" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}