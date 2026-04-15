import React from 'react';
import { motion } from 'framer-motion';
import { Fish, Zap, Target, Shield, BookOpen, Users } from 'lucide-react';

const features = [
  {
    icon: Fish,
    emoji: '🐟',
    title: 'Catch Logger mit KI',
    desc: 'Foto aufnehmen – die KI erkennt die Fischart, trägt Maße ein und berechnet deinen Strike Score automatisch.',
    color: 'tide',
  },
  {
    icon: Zap,
    emoji: '⚡',
    title: 'Fang-Vorhersage & Tide-Tracking',
    desc: 'Solunar-Phasen, Gezeitenkalender, Windprognosen und Barometerdruck-Trends für den perfekten Angelmoment.',
    color: 'sun',
  },
  {
    icon: Target,
    emoji: '🎯',
    title: 'Köder-Intelligenz',
    desc: 'Die App analysiert deine Fänge und empfiehlt dir den optimalen Köder – nach Jahreszeit, Gewässer und Wetter.',
    color: 'tide',
  },
  {
    icon: Shield,
    emoji: '🛡️',
    title: 'Trust-Score System',
    desc: 'Verifizierte Fänge per GPS & Foto. Transparente Community-Bewertung – fair und fälschungssicher.',
    color: 'sun',
  },
  {
    icon: BookOpen,
    emoji: '📋',
    title: 'Lizenz-Manager',
    desc: 'Angelscheine für 14 Länder direkt in der App. Kaufen, speichern, vorzeigen – ganz ohne Papierkram.',
    color: 'tide',
  },
  {
    icon: Users,
    emoji: '👥',
    title: 'Community & Coaches',
    desc: 'Crews, Turniere, Live-Chat und professionelle Angel-Coaches für deine nächste Session.',
    color: 'sun',
  },
];

const tideEase = [0.2, 0.8, 0.2, 1];

export default function LandingFeatures() {
  return (
    <section id="features" className="py-24 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-tide-400 text-sm font-bold uppercase tracking-widest">Features</span>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-foam mt-3 mb-4">
            Alles was du zum{' '}
            <span className="text-gradient-tide">Angeln brauchst</span>
          </h2>
          <p className="text-foam/50 text-lg max-w-2xl mx-auto">
            Von der KI-gestützten Fangerfassung bis zum Lizenz-Manager – StrikeAhead ist deine All-in-One Plattform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            const isSun = f.color === 'sun';
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: tideEase }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card rounded-3xl p-6 group"
                style={{
                  border: isSun
                    ? '1px solid rgba(245,195,75,0.18)'
                    : '1px solid rgba(127,220,229,0.1)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5"
                  style={isSun ? {
                    background: 'linear-gradient(135deg, rgba(245,195,75,0.15), rgba(255,216,114,0.08))',
                    border: '1px solid rgba(245,195,75,0.3)',
                    boxShadow: '0 0 16px rgba(245,195,75,0.15)',
                  } : {
                    background: 'rgba(31,167,184,0.1)',
                    border: '1px solid rgba(31,167,184,0.25)',
                    boxShadow: '0 0 16px rgba(31,167,184,0.12)',
                  }}
                >
                  {f.emoji}
                </div>
                <h3 className="font-display font-bold text-lg text-foam mb-2">{f.title}</h3>
                <p className="text-foam/50 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}