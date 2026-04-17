import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronRight, Crown, Trophy, Star, Fish, Anchor, MapPin, Shield, BookOpen, Award,
  Hash, Target, Sparkles, Flame, Scale, Weight, Mountain, Ruler, Heart, MessageSquare, Zap,
} from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';

const tideEase = [0.2, 0.8, 0.2, 1];

// Lucide icon lookup — matches the `icon` string stored on Achievement records.
const ACHIEVEMENT_ICONS = {
  Fish, Hash, Target, Trophy, Award, Sparkles, Flame, Crown,
  Scale, Weight, Mountain, Ruler, Heart, MessageSquare, Zap, Star,
};

const RARITY_GLOW = {
  common:    { border: 'rgba(127,220,229,0.35)', glow: 'rgba(77,195,209,0.18)',  text: 'text-foam/80' },
  uncommon:  { border: 'rgba(46,224,201,0.45)',  glow: 'rgba(46,224,201,0.22)',  text: 'text-tide-300' },
  rare:      { border: 'rgba(245,195,75,0.45)',  glow: 'rgba(245,195,75,0.22)',  text: 'text-sun-300' },
  epic:      { border: 'rgba(255,107,91,0.5)',   glow: 'rgba(255,107,91,0.25)',  text: 'text-coral-400' },
  legendary: { border: 'rgba(182,240,60,0.55)',  glow: 'rgba(182,240,60,0.3)',   text: 'text-lime-300' },
};


const localeTag = (code) => {
  const map = { de: 'de-DE', en: 'en-US', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', hr: 'hr-HR', pt: 'pt-PT', nl: 'nl-NL', tr: 'tr-TR', el: 'el-GR', sq: 'sq-AL' };
  return map[code] || 'de-DE';
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [allAchievements, setAllAchievements] = useState([]);
  const [earnedCodes, setEarnedCodes] = useState(new Set());
  const { t, i18n } = useTranslation();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    Promise.all([
      base44.entities.Achievement.list('sort_order', 50).catch(() => []),
      base44.entities.UserAchievement.filter({ user_email: user.email }, '-unlocked_date', 100).catch(() => []),
    ]).then(([all, mine]) => {
      setAllAchievements(all || []);
      setEarnedCodes(new Set((mine || []).map((u) => u.achievement_code)));
    });
  }, [user?.email]);

  const achievements = React.useMemo(() => {
    const sorted = [...allAchievements].sort((a, b) => {
      const aE = earnedCodes.has(a.code) ? 0 : 1;
      const bE = earnedCodes.has(b.code) ? 0 : 1;
      if (aE !== bE) return aE - bE;
      return (a.sort_order || 0) - (b.sort_order || 0);
    });
    return sorted.map((a) => ({
      code: a.code,
      label: (i18n.language === 'de' ? a.name_de : a.name_en) || a.code,
      description: (i18n.language === 'de' ? a.description_de : a.description_en) || '',
      iconName: a.icon || 'Trophy',
      rarity: a.rarity || 'common',
      filled: earnedCodes.has(a.code),
    }));
  }, [allAchievements, earnedCodes, i18n.language]);

  const menuItems = [
    { icon: Fish, label: t('catches.myCatches'), hint: '', path: '/mycatches', color: 'text-tide-400' },
    { icon: Shield, label: t('licenses.myLicenses'), hint: '', path: '/mylicenses', color: 'text-tide-400' },
    { icon: BookOpen, label: t('bookings.myBookings'), hint: '', path: '/mybookings', color: 'text-tide-400' },
    { icon: Trophy, label: t('community.teams'), hint: '', path: '/teams', color: 'text-sun-400' },
    { icon: Anchor, label: t('subscription.title'), hint: '', path: '/subscription', color: 'text-sun-400' },
    { icon: Award, label: t('profile.angelschule'), hint: '', path: '/angelschule', color: 'text-tide-400' },
    { icon: MapPin, label: t('legal.imprint'), hint: '', path: '/imprint', color: 'text-foam/40' },
    { icon: Shield, label: t('legal.privacy'), hint: '', path: '/privacypolicy', color: 'text-foam/40' },
    { icon: BookOpen, label: t('legal.terms'), hint: '', path: '/termsofservice', color: 'text-foam/40' },
    { icon: Star, label: t('admin.title'), hint: '', path: '/admin', color: 'text-foam/40' },
  ];

  const isPremium = user?.premium_plan && user.premium_plan !== 'free';
  const firstName = user?.full_name?.split(' ')[0] || 'Angler';
  const totalCatches = user?.total_catches ?? 142;
  const fishXp = user?.fish_xp ?? 3840;
  const xpToNext = 5000;
  const xpPct = Math.min((fishXp / xpToNext) * 100, 100);

  return (
    <PageTransition>
      <div className="pb-4">
        {/* Cover / Header */}
        <div className="relative h-36 mb-16">
          <div className="absolute inset-0 gradient-tide opacity-40" style={{
            background: 'linear-gradient(135deg, #072637 0%, #0E4054 50%, #1FA7B8 100%)'
          }} />
          <div className="absolute inset-0" style={{
            backgroundImage: `url(${user?.cover_photo || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=70'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3
          }} />

          {/* Avatar */}
          <div className="absolute -bottom-12 left-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl gradient-tide glow-tide flex items-center justify-center text-4xl border-4 border-abyss-950 overflow-hidden">
                {user?.profile_photo
                  ? <img src={user.profile_photo} alt="Avatar" className="w-full h-full object-cover" />
                  : '🎣'
                }
              </div>
              {isPremium && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-sun-400 rounded-lg flex items-center justify-center glow-sun">
                  <Crown className="w-3.5 h-3.5 text-abyss-950" />
                </div>
              )}
            </div>
          </div>

          {/* Badges top-right */}
          <div className="absolute top-3 right-4 flex gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(31,167,184,0.2)', color: '#4DC3D1', border: '1px solid rgba(31,167,184,0.3)' }}>
              Lvl 24
            </span>
            {isPremium && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{ background: 'rgba(245,195,75,0.2)', color: '#F5C34B', border: '1px solid rgba(245,195,75,0.3)' }}>
                PRO
              </span>
            )}
          </div>
        </div>

        <div className="px-4 space-y-5">
          {/* Name block */}
          <div>
            <h1 className="font-display text-2xl font-extrabold text-foam">{user?.full_name || 'Angler'}</h1>
            <p className="text-foam/50 text-sm mt-0.5">
              {isPremium
                ? t('profile.pro_since', {
                    date: user?.created_date ? new Date(user.created_date).toLocaleDateString(localeTag(i18n.language), { month: 'long', year: 'numeric' }) : '',
                    location: user?.location || t('profile.default_location')
                  })
                : `Free · ${user?.location || t('profile.default_location')}`
              }
            </p>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: t('profile.stats.catches'), value: totalCatches },
              { label: t('profile.stats.species'), value: 24 },
              { label: t('profile.stats.rank'), value: '#12' },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-2xl p-3 text-center">
                <p className="font-display font-extrabold text-xl text-gradient-tide">{s.value}</p>
                <p className="text-foam/40 text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          {/* XP Bar — tide→sun gradient milestone feel */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-foam font-bold text-sm">{t('profile.level_progress', { current: 24, next: 25 })}</span>
              <span className="text-sun-gradient text-sm font-bold font-display">{fishXp.toLocaleString(localeTag(i18n.language))} / {xpToNext.toLocaleString(localeTag(i18n.language))} XP</span>
            </div>
            <div className="h-3 bg-abyss-700 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #1FA7B8 0%, #F5C34B 100%)' }}
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1.4, delay: 0.3, ease: tideEase }}
              />
              <div className="absolute inset-0 rounded-full overflow-hidden opacity-40">
                <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer"
                  style={{ backgroundSize: '200% 100%' }} />
              </div>
            </div>
            <p className="text-foam/30 text-xs mt-1">{Math.round(xpPct)}{t('profile.xp_to_next')}</p>
          </div>

          {/* Achievements — unlocked get sun gradient glow */}
          <div>
            <p className="text-foam/50 text-xs uppercase tracking-widest mb-3">{t('profile.achievements.title')}</p>
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
              {achievements.map((a, i) => {
                const Icon = ACHIEVEMENT_ICONS[a.iconName] || Trophy;
                const glow = RARITY_GLOW[a.rarity] || RARITY_GLOW.common;
                return (
                  <motion.div
                    key={a.code || i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.07 }}
                    className="flex-shrink-0 w-16 flex flex-col items-center gap-1.5"
                    title={a.description}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                      style={a.filled ? {
                        background: `linear-gradient(135deg, ${glow.glow} 0%, rgba(255,255,255,0.03) 100%)`,
                        border: `1px solid ${glow.border}`,
                        boxShadow: `0 0 14px ${glow.glow}`,
                      } : {
                        background: 'rgba(31,167,184,0.07)',
                        border: '1px solid rgba(127,220,229,0.12)',
                        opacity: 0.4,
                      }}
                    >
                      <Icon className={`w-6 h-6 ${a.filled ? glow.text : 'text-foam/40'}`} />
                    </div>
                    <p className={`text-[9px] text-center leading-tight ${a.filled ? glow.text : 'text-foam/30'}`}>{a.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Menu */}
          <div className="space-y-2">
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04, ease: tideEase }}
                >
                  <Link to={item.path}>
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className="glass-card rounded-2xl px-4 py-3.5 flex items-center gap-3"
                    >
                      <div className={`w-9 h-9 rounded-xl bg-abyss-700/80 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4.5 h-4.5 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foam font-semibold text-sm">{item.label}</p>
                        {item.hint && <p className="text-foam/40 text-xs">{item.hint}</p>}
                      </div>
                      <ChevronRight className="w-4 h-4 text-foam/25 flex-shrink-0" />
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-foam/20 text-xs">{t('profile.footer')}</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}