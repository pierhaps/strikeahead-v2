import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Brain, Crosshair } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const tideEase = [0.2, 0.8, 0.2, 1];
const icons = [Camera, Brain, Crosshair];
const emojis = ['📸','🧠','🎯'];
const colors = ['tide','sun','tide'];

export default function LandingHowItWorks() {
  const { t } = useTranslation();

  const steps = [1,2,3].map((n, i) => ({
    num: `0${n}`,
    icon: icons[i],
    emoji: emojis[i],
    title: t(`landing.how.${n}_title`),
    desc: t(`landing.how.${n}_desc`),
    color: colors[i],
  }));

  return (
    <section id="how-it-works" className="py-24 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sun-400 text-sm font-bold uppercase tracking-widest">{t('landing.how.label')}</span>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-foam mt-3 mb-4">
            {t('landing.how.title')}
          </h2>
        </div>
        <div className="relative flex flex-col lg:flex-row gap-6 lg:gap-0">
          <div className="hidden lg:block absolute top-12 left-[calc(16.666%+28px)] right-[calc(16.666%+28px)] h-0.5"
            style={{ background: 'linear-gradient(90deg, #1FA7B8, #F5C34B, #1FA7B8)', opacity: 0.3 }} />
          {steps.map((step, i) => {
            const isSun = step.color === 'sun';
            return (
              <motion.div key={step.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5, delay: i * 0.15, ease: tideEase }}
                className="flex-1 flex flex-col items-center text-center px-4 lg:px-8">
                <div className="relative w-24 h-24 rounded-full flex items-center justify-center text-3xl mb-6 flex-shrink-0"
                  style={isSun ? { background: 'linear-gradient(135deg, rgba(245,195,75,0.15), rgba(255,216,114,0.06))', border: '2px solid rgba(245,195,75,0.4)', boxShadow: '0 0 30px rgba(245,195,75,0.2)' }
                    : { background: 'linear-gradient(135deg, rgba(31,167,184,0.12), rgba(77,195,209,0.06))', border: '2px solid rgba(31,167,184,0.35)', boxShadow: '0 0 30px rgba(31,167,184,0.18)' }}>
                  {step.emoji}
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full text-[10px] font-bold font-display flex items-center justify-center"
                    style={{ background: isSun ? '#F5C34B' : '#1FA7B8', color: '#021521' }}>
                    {step.num.replace('0', '')}
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl text-foam mb-3">{step.title}</h3>
                <p className="text-foam/50 text-sm leading-relaxed max-w-xs">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}