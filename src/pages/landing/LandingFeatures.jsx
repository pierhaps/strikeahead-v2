import React from 'react';
import { motion } from 'framer-motion';
import { Fish, Zap, Target, Shield, BookOpen, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const tideEase = [0.2, 0.8, 0.2, 1];
const icons = [Fish, Zap, Target, Shield, BookOpen, Users];
const emojis = ['🐟','⚡','🎯','🛡️','📋','👥'];
const colors = ['tide','sun','tide','sun','tide','sun'];

export default function LandingFeatures() {
  const { t } = useTranslation();

  const features = [1,2,3,4,5,6].map((n, i) => ({
    icon: icons[i],
    emoji: emojis[i],
    title: t(`landing.features.${n}_title`),
    desc: t(`landing.features.${n}_desc`),
    color: colors[i],
  }));

  return (
    <section id="features" className="py-24 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-tide-400 text-sm font-bold uppercase tracking-widest">Features</span>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-foam mt-3 mb-4">
            {t('landing.features.title')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            const isSun = f.color === 'sun';
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5, delay: i * 0.07, ease: tideEase }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card rounded-3xl p-6 group"
                style={{ border: isSun ? '1px solid rgba(245,195,75,0.18)' : '1px solid rgba(127,220,229,0.1)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5"
                  style={isSun ? { background: 'linear-gradient(135deg, rgba(245,195,75,0.15), rgba(255,216,114,0.08))', border: '1px solid rgba(245,195,75,0.3)', boxShadow: '0 0 16px rgba(245,195,75,0.15)' }
                    : { background: 'rgba(31,167,184,0.1)', border: '1px solid rgba(31,167,184,0.25)', boxShadow: '0 0 16px rgba(31,167,184,0.12)' }}>
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