import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BarChart2, MapPin, User, Plus } from 'lucide-react';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/dashboard', icon: BarChart2, label: 'Stats' },
  { path: '/upload', icon: Plus, label: 'Log', isCenter: true },
  { path: '/map', icon: MapPin, label: 'Map' },
  { path: '/profile', icon: User, label: 'Profil' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <div
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <nav className="glass-strong rounded-full px-2 py-2 flex items-center justify-around glow-tide">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          if (tab.isCenter) {
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className="relative -mt-8 flex flex-col items-center"
              >
                <motion.div
                  whileTap={{ scale: 0.93 }}
                  className="w-14 h-14 rounded-full gradient-tide glow-tide flex items-center justify-center shadow-lg"
                >
                  <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                </motion.div>
                <span className="text-[10px] mt-1 text-tide-300 font-medium">{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link key={tab.path} to={tab.path} className="relative flex flex-col items-center min-w-[52px] py-1 px-1">
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-2xl bg-tide-500/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <motion.div whileTap={{ scale: 0.93 }} className="flex flex-col items-center relative z-10">
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-tide-400' : 'text-foam/40'}`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span className={`text-[10px] mt-0.5 font-medium transition-colors duration-200 ${isActive ? 'text-tide-300' : 'text-foam/40'}`}>
                  {tab.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}