import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';
import { usePremiumCheck } from '../hooks/usePremiumCheck';

const FEATURE_LABELS = { de: "Saisonale Fang-Vorhersagen", en: "Seasonal Catch Forecasts", es: "Pronósticos de Captura Estacionales", fr: "Prévisions de Prise Saisonnières", it: "Previsioni di Cattura Stagionali", nl: "Seizoensgebonden Vangstvoorspellingen", tr: "Mevsimsel Av Tahminleri", hr: "Sezonske Prognoze Ulova", pt: "Previsões de Captura Sazonais", el: "Εποχιακές Προβλέψεις Αλιείας", ru: "Сезонные Прогнозы Улова" };
const PREMIUM_CTA = { de: "Alle 12 Monate freischalten", en: "Unlock all 12 months", es: "Desbloquear los 12 meses", fr: "Débloquer les 12 mois", it: "Sblocca tutti i 12 mesi", nl: "Alle 12 maanden ontgrendelen", tr: "Tüm 12 ayı açın", hr: "Otključaj svih 12 mjeseci", pt: "Desbloquear todos os 12 meses", el: "Ξεκλειδώστε και τους 12 μήνες", ru: "Разблокировать все 12 месяцев" };

const tideEase = [0.2, 0.8, 0.2, 1];

const ACTIVITY_CFG = {
  dormant: { label: 'seasonguide.activity.dormant', color: '#7FDCE5', bg: 'rgba(127,220,229,0.1)', bar: 10 },
  low: { label: 'seasonguide.activity.low', color: '#4DC3D1', bg: 'rgba(77,195,209,0.12)', bar: 25 },
  moderate: { label: 'seasonguide.activity.moderate', color: '#F5C34B', bg: 'rgba(245,195,75,0.12)', bar: 55 },
  high: { label: 'seasonguide.activity.high', color: '#FFD872', bg: 'rgba(255,216,114,0.15)', bar: 80 },
  peak: { label: 'seasonguide.activity.peak', color: '#FF6B5B', bg: 'rgba(255,107,91,0.15)', bar: 100 },
};

const TIME_DE_KEYS = {
  dawn: 'seasonguide.time.dawn',
  morning: 'seasonguide.time.morning',
  midday: 'seasonguide.time.midday',
  afternoon: 'seasonguide.time.afternoon',
  dusk: 'seasonguide.time.dusk',
  night: 'seasonguide.time.night',
  any: 'seasonguide.time.anytime'
};

export default function SeasonGuide() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'de').split('-')[0];
  const { isPremium, isAdmin } = usePremiumCheck();
  const canAccessAll = isPremium || isAdmin;
  const navigate = useNavigate();
  const currentMonth = new Date().getMonth() + 1;
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(currentMonth);

  useEffect(() => {
    base44.entities.SeasonalPattern.list('species', 500).then(d => { setPatterns(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const forMonth = patterns
    .filter(p => p.month === month)
    .sort((a, b) => {
      const order = { peak: 5, high: 4, moderate: 3, low: 2, dormant: 1 };
      return (order[b.activity_level] || 0) - (order[a.activity_level] || 0);
    });

  if (loading) return <PageTransition><div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" /></div></PageTransition>;

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-5">
        <div>
          <p className="text-foam/50 text-sm">{t('seasonguide.subtitle')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('seasonguide.title')}</h1>
        </div>

        <div className="glass-card rounded-2xl p-3">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => (
              <button key={m} onClick={() => setMonth(m)}
                className={`flex-shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all ${month === m ? 'gradient-tide text-white glow-tide' : 'bg-abyss-700 text-foam/50'}`}>
                <span className="text-[10px] font-bold">{t(`months_short.${m}`)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <h2 className="font-display font-bold text-foam text-lg">{t(`months_short.${month}`)}</h2>
          <span className="text-foam/40 text-sm">· {forMonth.length} {forMonth.length === 1 ? 'record' : 'records'}</span>
        </div>

        {!canAccessAll && month !== currentMonth ? (
          <div className="glass-card rounded-3xl p-8 text-center space-y-4"
            style={{ border: '1px solid rgba(182,240,60,0.2)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: 'rgba(182,240,60,0.12)', border: '1px solid rgba(182,240,60,0.3)' }}>
              <Lock className="w-7 h-7 text-lime2" />
            </div>
            <div>
              <p className="font-display font-bold text-foam text-lg">{FEATURE_LABELS[lang] || FEATURE_LABELS.en}</p>
              <p className="text-foam/50 text-sm mt-1">{t(`months_short.${month}`)}</p>
            </div>
            <button onClick={() => navigate('/subscription')}
              className="w-full py-3.5 rounded-2xl font-bold text-navy-900"
              style={{ background: 'linear-gradient(225deg, #B6F03C 0%, #2EE0C9 55%, #2DA8FF 100%)', boxShadow: '0 8px 24px rgba(46,224,201,0.3)' }}>
              {PREMIUM_CTA[lang] || PREMIUM_CTA.en}
            </button>
          </div>
        ) : forMonth.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center">
            <div className="text-5xl mb-4">📅</div>
            <p className="font-display font-bold text-foam">{t('seasonguide.empty_title')}</p>
            <p className="text-foam/40 text-sm mt-2">{t('seasonguide.empty_desc')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {forMonth.map((p, i) => {
              const ac = ACTIVITY_CFG[p.activity_level] || ACTIVITY_CFG.low;
              return (
                <motion.div key={p.id || i}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, ease: tideEase }}
                  className="glass-card rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-display font-bold text-foam">{p.species}</p>
                      {p.region && <p className="text-foam/40 text-xs">{p.region}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold"
                        style={{ background: ac.bg, color: ac.color, border: `1px solid ${ac.color}33` }}>
                        {t(ac.label)}
                      </span>
                      {p.spawning_period && (
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-coral-500/12 text-coral-500">{t('seasonguide.spawning')} ⚠️</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="h-1.5 bg-abyss-700 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        style={{ background: ac.color }}
                        initial={{ width: 0 }} animate={{ width: `${ac.bar}%` }}
                        transition={{ duration: 0.7, delay: i * 0.05 }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {p.best_technique && (
                      <div className="glass-card rounded-lg p-2">
                        <p className="text-foam/40 text-[10px]">{t('seasonguide.label.technique')}</p>
                        <p className="text-foam font-semibold">{p.best_technique}</p>
                      </div>
                    )}
                    {p.best_time_of_day && (
                      <div className="glass-card rounded-lg p-2">
                        <p className="text-foam/40 text-[10px]">{t('seasonguide.best_time')}</p>
                        <p className="text-foam font-semibold">{t(TIME_DE_KEYS[p.best_time_of_day] || 'seasonguide.time.anytime')}</p>
                      </div>
                    )}
                    {p.best_depth_m && (
                      <div className="glass-card rounded-lg p-2">
                        <p className="text-foam/40 text-[10px]">{t('seasonguide.label.depth')}</p>
                        <p className="text-foam font-semibold">{p.best_depth_m} m</p>
                      </div>
                    )}
                    {p.catch_probability != null && (
                      <div className="glass-card rounded-lg p-2">
                        <p className="text-foam/40 text-[10px]">{t('seasonguide.label.probability')}</p>
                        <p className="text-foam font-semibold">{p.catch_probability}%</p>
                      </div>
                    )}
                  </div>

                  {p.best_bait && <p className="text-foam/50 text-xs mt-2">🪝 {p.best_bait}</p>}
                  {p.notes && <p className="text-foam/40 text-xs mt-1 italic">{p.notes}</p>}
                </motion.div>
              );
            })}
          </div>
        )}
        <div className="h-4" />
      </div>
    </PageTransition>
  );
}