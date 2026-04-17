import React from 'react';
import { motion } from 'framer-motion';
import { Check, Apple, Play, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const tideEase = [0.2, 0.8, 0.2, 1];

function formatPrice(amount, lang) {
  const locale = { de:'de-DE', en:'en-GB', es:'es-ES', fr:'fr-FR', it:'it-IT', hr:'hr-HR', pt:'pt-PT', nl:'nl-NL', tr:'tr-TR', el:'el-GR', sq:'sq-AL' }[lang] || 'en-GB';
  if (amount === 0) return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(0);
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(amount);
}

export default function LandingPricing() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || 'en';

  const plans = [
    { key: 'free', price: 0, color: 'default', ctaStyle: 'border border-foam/20 text-foam hover:border-tide-400/40', highlighted: false },
    { key: 'angler', price: 4.99, color: 'tide', ctaStyle: 'gradient-tide text-white glow-tide', highlighted: false },
    { key: 'pro', price: 9.99, color: 'sun', ctaStyle: 'text-abyss-950 font-bold', highlighted: true },
    { key: 'legend', price: 19.99, color: 'default', ctaStyle: 'border border-foam/20 text-foam hover:border-sun-400/40', highlighted: false },
  ];

  return (
    <section id="pricing" className="py-24 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sun-400 text-sm font-bold uppercase tracking-widest">{t('landing.pricing.label')}</span>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-foam mt-3 mb-4">
            {t('landing.pricing.title')}
          </h2>
          <p className="text-foam/50 text-lg max-w-xl mx-auto">{t('landing.pricing.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {plans.map((plan, i) => {
            const features = t(`landing.pricing.${plan.key}_features`, { returnObjects: true }) || [];
            return (
              <motion.div key={plan.key} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5, delay: i * 0.08, ease: tideEase }}
                className={`relative rounded-3xl p-6 flex flex-col ${plan.highlighted ? 'pt-10' : ''}`}
                style={plan.highlighted ? { background: 'rgba(7,38,55,0.7)', boxShadow: '0 0 0 2px #F5C34B, 0 0 40px rgba(245,195,75,0.25)' }
                  : { background: 'rgba(7,38,55,0.55)', backdropFilter: 'blur(20px)', border: '1px solid rgba(127,220,229,0.1)' }}>
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                    style={{ background: '#F5C34B', color: '#021521' }}>
                    {t('landing.pricing.highlight_badge')}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`font-display font-extrabold text-xl mb-1 ${plan.color === 'sun' ? 'text-sun-400' : plan.color === 'tide' ? 'text-tide-400' : 'text-foam'}`}>
                    {t(`landing.pricing.${plan.key}_title`)}
                  </h3>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-extrabold text-4xl text-foam">{formatPrice(plan.price, lang)}</span>
                    <span className="text-foam/40 text-sm">{t(`landing.pricing.${plan.key}_period`)}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {Array.isArray(features) && features.map((f, fi) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.color === 'sun' ? 'text-sun-400' : plan.color === 'tide' ? 'text-tide-400' : 'text-foam/50'}`} />
                      <span className="text-foam/70 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <motion.a href="#" whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
                  className={`block text-center py-3.5 rounded-2xl font-display font-bold transition-all duration-200 ${plan.highlighted ? 'text-abyss-950' : plan.ctaStyle}`}
                  style={plan.highlighted ? { background: 'linear-gradient(135deg, #FFD872, #F5C34B)', boxShadow: '0 0 24px rgba(245,195,75,0.35)' } : {}}>
                  {t(`landing.pricing.${plan.key}_cta`)}
                </motion.a>
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          {[Globe, Apple, Play].map((Icon, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-foam/60"
              style={{ background: 'rgba(127,220,229,0.06)', border: '1px solid rgba(127,220,229,0.15)' }}>
              <Icon className="w-4 h-4 text-tide-400" />
              {t(`landing.pricing.channel_${['web','ios','android'][i]}`)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}