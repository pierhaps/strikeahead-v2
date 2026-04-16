import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Home, BarChart2, MapPin, User, Plus, X, ChevronDown, LogOut, Shield,
  Fish, BookOpen, Compass, Droplets, Award, Target, Trophy, Users,
  MessageCircle, GraduationCap, Calendar, FileText, Scroll,
  Sparkles, Crown, Zap, Waves, Ruler, Camera, Utensils, Map as MapIcon,
  Search, Clock, ChefHat, Heart, Anchor, Gavel, Eye, FileCheck,
} from 'lucide-react';
import LanguageSwitcher from '../shared/LanguageSwitcher';
import { useAuth } from '@/lib/AuthContext';
import { useEntitlement } from '@/hooks/useEntitlement';

// Category → routes mapping (icons + translation keys)
const DRAWER_SECTIONS = [
  {
    key: 'core',
    icon: Home,
    items: [
      { path: '/', icon: Home, key: 'home' },
      { path: '/dashboard', icon: BarChart2, key: 'dashboard' },
      { path: '/upload', icon: Plus, key: 'upload' },
      { path: '/map', icon: MapPin, key: 'map' },
      { path: '/profile', icon: User, key: 'profile' },
    ],
  },
  {
    key: 'catches',
    icon: Fish,
    items: [
      { path: '/mycatches', icon: Fish, key: 'my_catches' },
      { path: '/fishingdiary', icon: BookOpen, key: 'diary' },
      { path: '/statistics', icon: BarChart2, key: 'statistics' },
      { path: '/analytics', icon: Zap, key: 'analytics', premium: true },
      { path: '/catchmap', icon: MapIcon, key: 'catch_map' },
      { path: '/catchforecast', icon: Sparkles, key: 'catch_forecast', premium: true },
    ],
  },
  {
    key: 'knowledge',
    icon: BookOpen,
    items: [
      { path: '/fishencyclopedia', icon: Fish, key: 'encyclopedia' },
      { path: '/fishfamilies', icon: Compass, key: 'families' },
      { path: '/seasonguide', icon: Calendar, key: 'season_guide' },
      { path: '/baitcatalog', icon: Target, key: 'bait_catalog' },
      { path: '/baitdatabase', icon: Search, key: 'bait_database', premium: true },
      { path: '/regulations', icon: Gavel, key: 'regulations' },
      { path: '/licensesearch', icon: FileCheck, key: 'license_search' },
      { path: '/mylicenses', icon: Scroll, key: 'my_licenses' },
      { path: '/angelschule', icon: GraduationCap, key: 'school' },
      { path: '/fishidentify', icon: Camera, key: 'identify' },
      { path: '/fishmeasure', icon: Ruler, key: 'measure' },
    ],
  },
  {
    key: 'tools',
    icon: Waves,
    items: [
      { path: '/tidecatch', icon: Waves, key: 'tide_catch' },
      { path: '/aiinsights', icon: Sparkles, key: 'ai_insights', premium: true },
      { path: '/skillprofile', icon: Award, key: 'skill_profile' },
      { path: '/anglersystem', icon: Heart, key: 'angler_system' },
    ],
  },
  {
    key: 'community',
    icon: Users,
    items: [
      { path: '/feed', icon: MessageCircle, key: 'feed' },
      { path: '/anglerchat', icon: MessageCircle, key: 'chat' },
      { path: '/leaderboard', icon: Trophy, key: 'leaderboard' },
      { path: '/teams', icon: Users, key: 'teams' },
      { path: '/tournaments', icon: Trophy, key: 'tournaments' },
      { path: '/competitions', icon: Target, key: 'competitions' },
      { path: '/challenges', icon: Zap, key: 'challenges' },
      { path: '/cleanupchallenges', icon: Droplets, key: 'cleanup' },
    ],
  },
  {
    key: 'coaching',
    icon: GraduationCap,
    items: [
      { path: '/coaches', icon: GraduationCap, key: 'coaches' },
      { path: '/bookcoach', icon: Calendar, key: 'book_coach' },
      { path: '/mybookings', icon: FileText, key: 'my_bookings' },
      { path: '/guidedirectory', icon: Compass, key: 'guide_directory' },
    ],
  },
  {
    key: 'account',
    icon: Crown,
    items: [
      { path: '/subscription', icon: Crown, key: 'subscription' },
      { path: '/roadmap', icon: MapIcon, key: 'roadmap' },
    ],
  },
  {
    key: 'legal',
    icon: FileText,
    items: [
      { path: '/imprint', icon: FileText, key: 'imprint' },
      { path: '/privacypolicy', icon: Shield, key: 'privacy' },
      { path: '/termsofservice', icon: Gavel, key: 'terms' },
    ],
  },
];

function DrawerItem({ item, onClose, t }) {
  const location = useLocation();
  const Icon = item.icon;
  const isActive = location.pathname === item.path;
  return (
    <Link
      to={item.path}
      onClick={onClose}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
        isActive
          ? 'bg-gradient-to-r from-tide-500/15 to-mint-400/10 text-foam border border-tide-400/20'
          : 'text-foam/70 hover:text-foam hover:bg-foam/5'
      }`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-tide-400' : 'text-foam/50'}`} />
      <span className="flex-1 font-medium">{t(`drawer.items.${item.key}`, { defaultValue: item.key })}</span>
      {item.premium && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sun-400/20 text-sun-400">
          PRO
        </span>
      )}
    </Link>
  );
}

function DrawerSection({ section, t, defaultOpen, onClose }) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = section.icon;
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2 text-foam/50 hover:text-foam/80 transition-colors"
      >
        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="flex-1 text-left text-[11px] font-bold uppercase tracking-wider">
          {t(`drawer.sections.${section.key}`, { defaultValue: section.key })}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pl-1 space-y-0.5">
              {section.items.map((item) => (
                <DrawerItem key={item.path} item={item} onClose={onClose} t={t} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AppDrawer({ open, onClose }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isPremium, isAdmin } = useEntitlement();

  // Dynamic "admin" entry if user is admin
  const adminSection = isAdmin
    ? {
        key: 'admin',
        icon: Shield,
        items: [{ path: '/admin', icon: Shield, key: 'admin' }],
      }
    : null;

  const sections = adminSection
    ? [...DRAWER_SECTIONS.slice(0, -1), adminSection, DRAWER_SECTIONS[DRAWER_SECTIONS.length - 1]]
    : DRAWER_SECTIONS;

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
            style={{ background: 'rgba(2,21,33,0.7)', backdropFilter: 'blur(6px)' }}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed top-0 right-0 bottom-0 z-[61] w-[88%] max-w-sm flex flex-col"
            style={{
              background: 'linear-gradient(180deg, #0A1828 0%, #02152B 100%)',
              borderLeft: '1px solid rgba(232,240,245,0.08)',
              boxShadow: '-16px 0 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-foam/5"
              style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-foam/40">
                  {t('drawer.menu', { defaultValue: 'Menü' })}
                </p>
                {user && (
                  <p className="text-sm font-semibold text-foam">
                    {user.full_name || user.email}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-foam/60 hover:text-foam hover:bg-foam/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status badges */}
            <div className="px-4 py-3 flex items-center gap-2 border-b border-foam/5">
              {isPremium ? (
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-gradient-to-r from-sun-400/20 to-sun-500/20 text-sun-300 border border-sun-400/30">
                  <Crown className="w-3 h-3" /> {t('drawer.badge_premium', { defaultValue: 'Premium' })}
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-foam/5 text-foam/60 border border-foam/10">
                  {t('drawer.badge_free', { defaultValue: 'Free' })}
                </span>
              )}
              {isAdmin && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-400/30">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </div>

            {/* Language switcher */}
            <div className="px-4 py-3 border-b border-foam/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-foam/40 mb-2">
                {t('drawer.language', { defaultValue: 'Sprache' })}
              </p>
              <LanguageSwitcher />
            </div>

            {/* Sections */}
            <nav className="flex-1 overflow-y-auto px-2 py-3">
              {sections.map((section, i) => (
                <DrawerSection
                  key={section.key}
                  section={section}
                  t={t}
                  defaultOpen={i < 2}
                  onClose={onClose}
                />
              ))}
            </nav>

            {/* Footer — logout */}
            <div
              className="px-4 py-3 border-t border-foam/5"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
            >
              <button
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-foam/70 hover:text-red-300 hover:bg-red-500/10 border border-foam/10 hover:border-red-400/30 transition-all"
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
