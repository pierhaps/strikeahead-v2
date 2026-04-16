import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BarChart2, MapPin, User, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * BottomNav — iOS 26 Liquid Glass
 *  - Translucent pill tab bar with liquid glass effect
 *  - Teal active icon with subtle glow + dot indicator
 *  - Center Log (+) button: strike-gradient circle, clean & elevated
 */
export default function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  const tabs = [
    { path: '/',          icon: Home,      label: t('nav.home',    { defaultValue: 'Home' }) },
    { path: '/dashboard', icon: BarChart2, label: t('nav.stats') },
    { path: '/upload',    icon: Plus,      label: t('nav.log'), isCenter: true },
    { path: '/map',       icon: MapPin,    label: t('nav.map') },
    { path: '/profile',   icon: User,      label: t('nav.profile') },
  ];

  return (
    <div
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <nav
        className="liquid-glass-tab rounded-[22px] px-2 py-2 flex items-center justify-around"
        style={{
          background: 'rgba(10, 24, 40, 0.45)',
          backdropFilter: 'blur(24px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
          boxShadow:
            '0 8px 32px rgba(10,24,40,0.35), inset 0 0.5px 0 rgba(232,240,245,0.12), inset 0 -0.5px 0 rgba(10,24,40,0.2)',
          border: '0.5px solid rgba(232,240,245,0.08)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          /* ── Center Log button ── */
          if (tab.isCenter) {
            return (
              <Link
                key={tab.path}
                to={tab.path}
                aria-label={tab.label}
                className="relative -mt-5 flex flex-col items-center focus-strike"
              >
                <motion.div
                  whileTap={{ scale: 0.93 }}
                  className="w-[52px] h-[52px] rounded-full flex items-center justify-center relative z-10 overflow-hidden sheen"
                  style={{
                    background:
                      'linear-gradient(225deg, #B6F03C 0%, #2EE0C9 55%, #2DA8FF 100%)',
                    boxShadow:
                      '0 6px 20px rgba(46,224,201,0.30), 0 0 0 1.5px rgba(10,24,40,0.7)',
                  }}
                >
                  <Icon className="w-6 h-6 text-navy-900" strokeWidth={2.6} />
                </motion.div>
                <span className="text-[10px] mt-1 font-medium tracking-wide text-mist/60">
                  {tab.label}
                </span>
              </Link>
            );
          }

          /* ── Standard tab ── */
          return (
            <Link
              key={tab.path}
              to={tab.path}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center min-w-[52px] py-1.5 px-2 focus-strike"
            >
              <motion.div
                whileTap={{ scale: 0.92 }}
                className="flex flex-col items-center relative z-10"
              >
                <Icon
                  className="w-5 h-5 transition-colors duration-200"
                  strokeWidth={isActive ? 2.2 : 1.8}
                  style={{
                    color: isActive
                      ? '#2EE0C9'
                      : 'rgba(232,240,245,0.40)',
                    filter: isActive
                      ? 'drop-shadow(0 0 6px rgba(46,224,201,0.40))'
                      : undefined,
                  }}
                />
                <span
                  className="text-[10px] mt-0.5 font-medium transition-colors duration-200"
                  style={{
                    color: isActive
                      ? '#E8F0F5'
                      : 'rgba(232,240,245,0.40)',
                  }}
                >
                  {tab.label}
                </span>
              </motion.div>

              {/* Active dot indicator */}
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                  style={{
                    background: '#2EE0C9',
                    boxShadow: '0 0 6px rgba(46,224,201,0.50)',
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
