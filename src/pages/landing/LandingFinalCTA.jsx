import React from 'react';
import { motion } from 'framer-motion';
import { Apple, Play, Globe } from 'lucide-react';

const tideEase = [0.2, 0.8, 0.2, 1];

const ctaButtons = [
  { icon: Apple, label: 'Im App Store laden', sub: 'iOS 16+', href: '#', primary: false },
  { icon: Globe, label: 'Im Browser öffnen', sub: 'Sofort loslegen', href: '/dashboard', primary: true },
  { icon: Play, label: 'Bei Google Play', sub: 'Android 10+', href: '#', primary: false },
];

export default function LandingFinalCTA() {
  return (
    <section className="py-24 px-6 lg:px-10">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: tideEase }}
          className="glass-card rounded-[2.5rem] p-12 lg:p-16"
          style={{
            background: 'linear-gradient(135deg, rgba(7,38,55,0.8) 0%, rgba(14,64,84,0.6) 100%)',
            border: '1px solid rgba(127,220,229,0.15)',
            boxShadow: '0 0 60px rgba(31,167,184,0.12)',
          }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-8"
            style={{ background: 'rgba(245,195,75,0.1)', border: '1px solid rgba(245,195,75,0.3)', color: '#F5C34B' }}
          >
            ✦ Kostenlos starten
          </div>

          <h2 className="font-display font-extrabold text-4xl lg:text-6xl text-foam mb-6 leading-tight">
            Dein nächster Fang<br />
            wartet auf dich.
          </h2>

          <p className="text-foam/55 text-lg mb-10 max-w-xl mx-auto">
            Jetzt loslegen — auf iOS, Android oder direkt im Browser.
            Kein Kreditkarte nötig für den Free-Plan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
            {ctaButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <motion.a
                  key={btn.label}
                  href={btn.href}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-200 ${
                    btn.primary
                      ? 'text-abyss-950'
                      : 'glass-strong border border-foam/15 hover:border-tide-400/35 text-foam'
                  }`}
                  style={btn.primary ? {
                    background: 'linear-gradient(135deg, #FFD872, #F5C34B)',
                    boxShadow: '0 0 30px rgba(245,195,75,0.35)',
                  } : {}}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-display font-bold text-sm leading-tight">{btn.label}</p>
                    <p className="text-xs leading-none mt-0.5 opacity-60">{btn.sub}</p>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}