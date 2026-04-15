import React from 'react';
import { motion } from 'framer-motion';
import { Check, Apple, Play, Globe } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '0€',
    period: 'für immer',
    color: 'default',
    cta: 'Kostenlos starten',
    ctaStyle: 'border border-foam/20 text-foam hover:border-tide-400/40',
    features: [
      '10 Fänge / Monat',
      'KI-Arterkennung',
      'Community Feed lesen',
      'Grundlegende Statistiken',
    ],
  },
  {
    name: 'Angler',
    price: '4,99€',
    period: 'pro Monat',
    color: 'tide',
    cta: 'Angler werden',
    ctaStyle: 'gradient-tide text-white glow-tide',
    features: [
      'Unbegrenzte Fänge',
      'Strike Score Prognose',
      'Tide- & Wetter-Tracking',
      'Fischencyclopädie',
      'Lizenz-Manager (3 Länder)',
      'Community & Crews',
    ],
  },
  {
    name: 'Pro',
    price: '9,99€',
    period: 'pro Monat',
    color: 'sun',
    highlighted: true,
    badge: '⭐ Beliebteste Wahl',
    cta: 'Pro starten',
    ctaStyle: 'text-abyss-950 font-bold',
    features: [
      'Alles aus Angler',
      'KI-Köderempfehlungen',
      'Lizenz-Manager (14 Länder)',
      'Turnier-Teilnahme',
      'Coach-Buchungen',
      'Skill-Profil & Coaching',
      'Export & API-Zugang',
    ],
  },
  {
    name: 'Legend',
    price: '19,99€',
    period: 'pro Monat',
    color: 'default',
    cta: 'Legend werden',
    ctaStyle: 'border border-foam/20 text-foam hover:border-sun-400/40',
    features: [
      'Alles aus Pro',
      'Coach-Profil erstellen',
      'Sponsoring-Funktionen',
      'White-Label Turniere',
      'Prioritäts-Support',
      'Beta-Features zuerst',
    ],
  },
];

const tideEase = [0.2, 0.8, 0.2, 1];

export default function LandingPricing() {
  return (
    <section id="pricing" className="py-24 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sun-400 text-sm font-bold uppercase tracking-widest">Preise</span>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-foam mt-3 mb-4">
            Finde deinen{' '}
            <span className="text-gradient-sun">Plan</span>
          </h2>
          <p className="text-foam/50 text-lg max-w-xl mx-auto">
            Starte kostenlos. Upgrade jederzeit. Kündige monatlich.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: tideEase }}
              className={`relative rounded-3xl p-6 flex flex-col ${
                plan.highlighted ? 'pt-10' : ''
              }`}
              style={plan.highlighted ? {
                background: 'rgba(7,38,55,0.7)',
                border: '2px solid transparent',
                backgroundClip: 'padding-box',
                boxShadow: '0 0 0 2px #F5C34B, 0 0 40px rgba(245,195,75,0.25)',
              } : {
                background: 'rgba(7,38,55,0.55)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(127,220,229,0.1)',
              }}
            >
              {plan.badge && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                  style={{ background: '#F5C34B', color: '#021521' }}
                >
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-display font-extrabold text-xl mb-1 ${
                  plan.color === 'sun' ? 'text-sun-400' :
                  plan.color === 'tide' ? 'text-tide-400' :
                  'text-foam'
                }`}>{plan.name}</h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display font-extrabold text-4xl text-foam">{plan.price}</span>
                  <span className="text-foam/40 text-sm">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        plan.color === 'sun' ? 'text-sun-400' :
                        plan.color === 'tide' ? 'text-tide-400' :
                        'text-foam/50'
                      }`}
                    />
                    <span className="text-foam/70 text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              <motion.a
                href="#"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                className={`block text-center py-3.5 rounded-2xl font-display font-bold transition-all duration-200 ${
                  plan.highlighted
                    ? 'text-abyss-950'
                    : plan.ctaStyle
                }`}
                style={plan.highlighted ? {
                  background: 'linear-gradient(135deg, #FFD872, #F5C34B)',
                  boxShadow: '0 0 24px rgba(245,195,75,0.35)',
                } : {}}
              >
                {plan.cta}
              </motion.a>
            </motion.div>
          ))}
        </div>

        {/* Platform badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          {[
            { icon: Globe, label: 'Verfügbar im Web' },
            { icon: Apple, label: 'App Store' },
            { icon: Play, label: 'Google Play' },
          ].map(({ icon: BadgeIcon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-foam/60"
              style={{ background: 'rgba(127,220,229,0.06)', border: '1px solid rgba(127,220,229,0.15)' }}
            >
              <BadgeIcon className="w-4 h-4 text-tide-400" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}