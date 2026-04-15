import React from 'react';
import { motion } from 'framer-motion';
import { Apple, Play, Globe } from 'lucide-react';

const tideEase = [0.2, 0.8, 0.2, 1];

const ctaButtons = [
  {
    icon: Apple,
    label: 'Im App Store laden',
    sub: 'iOS 16+',
    href: '#',
    style: 'glass-strong border border-tide-300/20 hover:border-tide-400/40',
    iconColor: 'text-foam',
  },
  {
    icon: Play,
    label: 'Bei Google Play',
    sub: 'Android 10+',
    href: '#',
    style: 'glass-strong border border-tide-300/20 hover:border-tide-400/40',
    iconColor: 'text-foam',
  },
  {
    icon: Globe,
    label: 'Im Browser öffnen',
    sub: 'Kein Download nötig',
    href: '/dashboard',
    style: 'gradient-tide glow-tide',
    iconColor: 'text-white',
    primary: true,
  },
];

// Simulated iPhone screen content
function PhoneMockup() {
  return (
    <div className="relative mx-auto" style={{ width: 260 }}>
      {/* Glow behind phone */}
      <div
        className="absolute inset-0 rounded-[40px] blur-3xl opacity-40"
        style={{ background: 'linear-gradient(135deg, #1FA7B8 0%, #F5C34B 100%)', transform: 'scale(0.85) translateY(10%)' }}
      />
      {/* Phone shell */}
      <div
        className="relative rounded-[40px] overflow-hidden border-2 border-white/10"
        style={{
          background: '#021521',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
          aspectRatio: '9/19.5',
        }}
      >
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-10" />

        {/* Screen content */}
        <div className="w-full h-full pt-10 px-4 pb-6 flex flex-col gap-3 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-foam/40 text-[9px]">Willkommen zurück</p>
              <p className="font-display font-bold text-foam text-sm">Moin, Lars 🎣</p>
            </div>
            <div className="w-8 h-8 rounded-xl gradient-tide flex items-center justify-center text-base">🐟</div>
          </div>

          {/* Hero card */}
          <div className="glass-card rounded-2xl p-3">
            <p className="text-foam/40 text-[8px] uppercase tracking-widest">Fänge gesamt</p>
            <p className="font-display font-extrabold text-3xl text-sun-400">142</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[9px] text-foam/40">Fish XP</span>
              <div className="flex-1 h-1 bg-abyss-700 rounded-full overflow-hidden">
                <div className="h-full w-3/4 rounded-full" style={{ background: 'linear-gradient(90deg, #1FA7B8, #F5C34B)' }} />
              </div>
              <span className="text-[9px] text-sun-400 font-bold">73%</span>
            </div>
          </div>

          {/* Action tiles */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { emoji: '🐟', label: 'Fang loggen', gradient: true },
              { emoji: '🗺️', label: 'Hotspots', gradient: false },
              { emoji: '🌊', label: 'Tide', gradient: false },
              { emoji: '🏆', label: 'Turniere', gradient: false },
            ].map((t, i) => (
              <div
                key={i}
                className={`rounded-xl p-2 flex flex-col gap-1 ${t.gradient ? 'gradient-tide' : 'bg-abyss-700/60 border border-tide-300/10'}`}
              >
                <span className="text-base">{t.emoji}</span>
                <p className={`text-[9px] font-bold ${t.gradient ? 'text-white' : 'text-foam/70'}`}>{t.label}</p>
              </div>
            ))}
          </div>

          {/* Strike score badge */}
          <div
            className="rounded-xl px-3 py-2 flex items-center justify-between"
            style={{ background: 'rgba(245,195,75,0.1)', border: '1px solid rgba(245,195,75,0.25)' }}
          >
            <div>
              <p className="text-[8px] text-sun-400/60 uppercase tracking-widest">Strike Score</p>
              <p className="font-display font-extrabold text-sun-400 text-lg">87%</p>
            </div>
            <div className="text-2xl">⚡</div>
          </div>

          {/* Mini forecast */}
          <div className="glass-card rounded-xl p-2.5">
            <p className="text-[8px] text-foam/40 mb-1.5">Heute · Prognose</p>
            <div className="flex justify-between">
              {['6h', '9h', '12h', '15h', '18h'].map((t, i) => (
                <div key={t} className="flex flex-col items-center gap-0.5">
                  <div
                    className="w-1.5 rounded-full"
                    style={{
                      height: `${[20, 32, 16, 28, 22][i]}px`,
                      background: i === 3 ? '#F5C34B' : '#1FA7B8',
                      opacity: 0.7 + i * 0.06,
                    }}
                  />
                  <p className="text-[7px] text-foam/30">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingHero() {
  return (
    <section className="pt-28 pb-20 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
        {/* Left copy */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: tideEase }}
          >
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-5"
              style={{ background: 'rgba(245,195,75,0.12)', border: '1px solid rgba(245,195,75,0.3)', color: '#F5C34B' }}
            >
              ✦ Web · iOS · Android
            </span>

            <h1 className="font-display font-extrabold text-5xl lg:text-7xl text-foam leading-[1.05] mb-6">
              Time Your{' '}
              <span className="text-gradient-sun">Strike</span>
            </h1>

            <p className="text-foam/60 text-lg lg:text-xl leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
              Die intelligente Angel-App, die deine Fänge versteht.
              KI-gestützte Vorhersagen, Tide-Tracking und Community — alles in einer App.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-row items-center justify-center lg:justify-start gap-3 flex-wrap">
              {ctaButtons.map((btn) => {
                const Icon = btn.icon;
                return (
                  <motion.a
                    key={btn.label}
                    href={btn.href}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-200 ${btn.style}`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${btn.iconColor}`} />
                    <div className="text-left">
                      <p className={`font-display font-bold text-sm leading-tight ${btn.primary ? 'text-white' : 'text-foam'}`}>
                        {btn.label}
                      </p>
                      <p className={`text-xs leading-none mt-0.5 ${btn.primary ? 'text-white/70' : 'text-foam/40'}`}>
                        {btn.sub}
                      </p>
                    </div>
                  </motion.a>
                );
              })}
            </div>

            {/* Social proof */}
            <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-foam/40 text-sm">
              <span>⭐ 4.9 App Store</span>
              <span className="w-px h-4 bg-foam/10" />
              <span>🌍 14+ Länder</span>
              <span className="w-px h-4 bg-foam/10" />
              <span>🔒 DSGVO-konform</span>
            </div>
          </motion.div>
        </div>

        {/* Right — phone mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: tideEase }}
          className="flex-shrink-0"
        >
          <PhoneMockup />
        </motion.div>
      </div>
    </section>
  );
}