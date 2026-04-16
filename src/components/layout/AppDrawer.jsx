import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Fish, BookOpen, Users, Settings, Trophy, Zap, Map as MapIcon,
  Target, Scroll, FileText, Shield, Crown, Calendar, LogOut, X,
} from 'lucide-react';
import LanguageSwitcher from '../shared/LanguageSwitcher';
import { useAuth } from '@/lib/AuthContext';

/* ------------------------------------------------------------------ */
/*  Menu structure — 4 sections, ~15 items                            */
/* ------------------------------------------------------------------ */
const DRAWER_SECTIONS = [
  {
    key: 'my_catch',
    icon: Fish,
    items: [
      { path: '/mycatches', icon: Fish, key: 'my_catches' },
      { path: '/fishingdiary', icon: BookOpen, key: 'diary' },
      { path: '/catchmap', icon: MapIcon, key: 'catch_map' },
    ],
  },
  {
    key: 'knowledge',
    icon: BookOpen,
    items: [
      { path: '/fishencyclopedia', icon: Fish, key: 'encyclopedia' },
      { path: '/baitcatalog', icon: Target, key: 'bait_catalog' },
      { path: '/seasonguide', icon: Calendar, key: 'season_guide' },
      { path: '/regulations', icon: Scroll, key: 'regulations' },
    ],
  },
  {
    key: 'community',
    icon: Users,
    items: [
      { path: '/feed', icon: Users, key: 'feed' },
      { path: '/leaderboard', icon: Trophy, key: 'leaderboard' },
      { path: '/challenges', icon: Zap, key: 'challenges' },
      { path: '/tournaments', icon: Trophy, key: 'tournaments' },
    ],
  },
  {
    key: 'more',
    icon: Settings,
    items: [
      { path: '/subscription', icon: Crown, key: 'subscription' },
      { path: '/imprint', icon: FileText, key: 'imprint' },
      { path: '/privacypolicy', icon: Shield, key: 'privacy' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Spring transition config                                          */
/* ------------------------------------------------------------------ */
const panelSpring = { type: 'spring', stiffness: 340, damping: 36 };

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function AppDrawer({ open, onClose }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{
              background: 'rgba(2,21,33,0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={panelSpring}
            className="liquid-glass-heavy fixed top-0 right-0 bottom-0 z-[61] w-[72%] max-w-xs flex flex-col"
            style={{
              background:
                'linear-gradient(180deg, rgba(14,30,48,0.75) 0%, rgba(10,24,40,0.65) 100%)',
              borderLeft: '1px solid rgba(232,240,245,0.08)',
              boxShadow: '-12px 0 36px rgba(0,0,0,0.45)',
            }}
          >
            {/* ---- Header ---- */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
            >
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest"
                   style={{ color: 'rgba(232,240,245,0.35)' }}>
                  {t('drawer.menu', { defaultValue: 'Menu' })}
                </p>
                {user && (
                  <p className="text-sm font-semibold text-foam truncate">
                    {user.full_name || user.email}
                  </p>
                )}
              </div>
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.06 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                  border: '0.5px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 0.5px 0 0 rgba(255,255,255,0.20) inset, 0 4px 16px rgba(0,0,0,0.2)',
                }}
              >
                <X className="w-4 h-4 text-white/60" />
                <span className="text-[11px] font-medium text-white/50 tracking-wide uppercase">
                  {t('drawer.close', { defaultValue: 'Close' })}
                </span>
              </motion.button>
            </div>

            {/* ---- Nav sections ---- */}
            <nav className="flex-1 overflow-y-auto px-4 pt-2 pb-4 space-y-5">
              {DRAWER_SECTIONS.map((section) => {
                const SectionIcon = section.icon;
                return (
                  <div key={section.key}>
                    {/* Section header */}
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <SectionIcon className="w-3.5 h-3.5" style={{ color: 'rgba(232,240,245,0.35)' }} />
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: 'rgba(232,240,245,0.35)' }}
                      >
                        {t(`drawer.sections.${section.key}`, { defaultValue: section.key })}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className="relative flex items-center gap-3 px-3 rounded-lg transition-colors"
                            style={{ height: 44 }}
                          >
                            {/* Active accent bar */}
                            {isActive && (
                              <span
                                className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full"
                                style={{
                                  background: 'linear-gradient(180deg, #38bdf8, #34d399)',
                                }}
                              />
                            )}
                            <Icon
                              className="w-4 h-4 flex-shrink-0"
                              style={{ color: isActive ? '#38bdf8' : 'rgba(232,240,245,0.45)' }}
                            />
                            <span
                              className={`text-sm font-medium ${
                                isActive ? 'text-foam' : 'text-foam/65'
                              }`}
                            >
                              {t(`drawer.items.${item.key}`, { defaultValue: item.key })}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* ---- Footer ---- */}
            <div
              className="px-4 pt-2 pb-3 border-t border-foam/5 space-y-3"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
            >
              {/* Language switcher — compact */}
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: 'rgba(232,240,245,0.35)' }}
                >
                  {t('drawer.language', { defaultValue: 'Sprache' })}
                </span>
                <LanguageSwitcher />
              </div>

              {/* Logout */}
              <button
                onClick={() => { onClose(); logout(); }}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium text-foam/50 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('drawer.logout', { defaultValue: 'Abmelden' })}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
