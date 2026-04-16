import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BarChart2, MapPin, User, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * BottomNav — Brand v3
 *  - glass-strong pill with subtle navy gradient
 *  - lime/teal/cyan strike gradient active indicator
 *  - center Log (+) button: strike-gradient FAB with halo
 */
export default function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  const tabs = [
    { path: '/',          icon: Home,     label: t('nav.home',      { defaultValue: 'Home' }) },
    { path: '/dashboard', icon: BarChart2,label: t('nav.stats',     { defaultValue: 'Stats' }) },
    { path: '/upload',    icon: Plus,     label: t('nav.log',       { defaultValue: 'Log' }), isCenter: true },
    { path: '/map',       icon: MapPin,   label: t('nav.map',       { defaultValue: 'Map' }) },
    { path: '/profile',   icon: User,     label: t('nav.profile',   { defaultValue: 'Profil' }) },
  ];

  return (
    <div
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <nav
        className="glass-strong rounded-pill px-2 py-2 flex items-center justify-around"
        style={{
          boxShadow:
            '0 16px 40px rgba(10,24,40,0.55), 0 0 0 1px rgba(232,240,245,0.06) inset',
        }}
      >
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          if (tab.isCenter) {
            return (
              <Link
                key={tab.path}
                to={tab.path}
                aria-label={tab.label}
                className="relative -mt-8 flex flex-col items-center focus-strike"
              >
                {/* halo */}
                <span
                  aria-hidden="true"
                  className="absolute rounded-full"
                  style={{
                    top: -8, left: -8, right: -8, bottom: 18,
                    background:
                      'radial-gradient(circle, rgba(46,224,201,0.35), transparent 60%)',
                    filter: 'blur(12px)',
                  }}
                />
                <motion.div
                  whileTap={{ scale: 0.93 }}
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-14 h-14 rounded-full flex items-center justify-center relative z-10 overflow-hidden sheen"
                  style={{
                    background:
                      'linear-gradient(225deg, #B6F03C 0%, #2EE0C9 55%, #2DA8FF 100%)',
                    boxShadow:
                      '0 10px 28px rgba(46,224,201,0.45), 0 0 0 2px rgba(10,24,40,0.85)',
                  }}
                >
                  <Icon className="w-7 h-7 text-navy-900" strokeWidth={2.8} />
                </motion.div>
                <span className="text-[10px] mt-1 font-semibold tracking-wide text-mist">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.path}
              to={tab.path}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center min-w-[52px] py-1 px-2 focus-strike"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(45,168,255,0.14), rgba(46,224,201,0.10))',
                    border: '1px solid rgba(46,224,201,0.22)',
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.92 }}
                className="flex flex-col items-center relative z-10"
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive ? 'text-strike-teal' : 'text-mist/45'
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={
                    isActive
                      ? { filter: 'drop-shadow(0 0 8px rgba(46,224,201,0.55))' }
                      : undefined
                  }
                />
                <span
                  className={`text-[10px] mt-0.5 font-medium transition-colors duration-200 ${
                    isActive ? 'text-mist' : 'text-mist/45'
                  }`}
                >
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
