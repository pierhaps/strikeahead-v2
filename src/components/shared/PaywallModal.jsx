import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Zap, X, Check, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '@/hooks/useAnalytics';
import { base44 } from '@/api/base44Client';

/**
 * PaywallModal — shown when a free user hits a premium feature.
 *
 * Props:
 *   open            — boolean
 *   onClose         — fn
 *   featureKey      — 'heatmap' | 'strike_score' | ...
 *   requiredTier    — 'angler' | 'pro' | 'legend'
 */
export default function PaywallModal({ open, onClose, featureKey, requiredTier = 'pro', triggerSource = '' }) {
  const { t } = useTranslation();

  // Track paywall_view on open
  useEffect(() => {
    if (!open) return;
    base44.auth.me().then(user => {
      if (!user?.email) return;
      trackEvent(user.email, 'paywall_view', {
        feature_key: featureKey,
        required_tier: requiredTier,
        trigger_source: triggerSource,
      });
    }).catch(() => {});
  }, [open]);

  const tierInfo = {
    angler: {
      icon: Zap,
      color: 'text-tide-400',
      gradient: 'from-tide-500/20 to-mint-400/15',
      border: 'border-tide-400/30',
    },
    pro: {
      icon: Crown,
      color: 'text-sun-400',
      gradient: 'from-sun-400/20 to-sun-500/20',
      border: 'border-sun-400/30',
    },
    legend: {
      icon: Sparkles,
      color: 'text-mint-400',
      gradient: 'from-mint-400/20 to-tide-500/15',
      border: 'border-mint-400/30',
    },
  }[requiredTier] || { icon: Crown, color: 'text-sun-400', gradient: 'from-sun-400/20 to-sun-500/20', border: 'border-sun-400/30' };

  const TierIcon = tierInfo.icon;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70]"
            style={{ background: 'rgba(2,21,33,0.75)', backdropFilter: 'blur(8px)' }}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[71] max-w-sm mx-auto rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #0A1828 0%, #02152B 100%)',
              border: '1px solid rgba(232,240,245,0.10)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-foam/60 hover:text-foam hover:bg-foam/10 transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Hero */}
            <div
              className={`px-6 pt-8 pb-6 bg-gradient-to-br ${tierInfo.gradient} border-b border-foam/5`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${tierInfo.gradient} border ${tierInfo.border}`}>
                <TierIcon className={`w-8 h-8 ${tierInfo.color}`} />
              </div>
              <h2 className="text-xl font-bold text-foam mb-2">
                {t(`paywall.title_${requiredTier}`, {
                  defaultValue: t('paywall.title', { defaultValue: 'Premium-Feature' }),
                })}
              </h2>
              <p className="text-sm text-foam/70 leading-relaxed">
                {t(`paywall.feature_${featureKey}`, {
                  defaultValue: t('paywall.description', {
                    defaultValue: 'Dieses Feature ist Teil deines Premium-Abos. Upgrade, um alle Analyse-Tools zu nutzen.',
                  }),
                })}
              </p>
            </div>

            {/* Benefits */}
            <div className="px-6 py-5 space-y-2.5">
              <Benefit text={t('paywall.benefit_strike', { defaultValue: 'Strike Score & AI Forecast' })} />
              <Benefit text={t('paywall.benefit_bait', { defaultValue: 'Bait Intelligence — 85 Köder-Kombis' })} />
              <Benefit text={t('paywall.benefit_heatmap', { defaultValue: 'Hotspot-Heatmap & Live-Wetter' })} />
              <Benefit text={t('paywall.benefit_diary', { defaultValue: 'Unbegrenztes Fangtagebuch + Export' })} />
            </div>

            {/* CTAs */}
            <div className="px-6 pb-6 space-y-2">
              <Link
                to="/subscription"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-navy-900"
                style={{
                  background: 'linear-gradient(225deg, #B6F03C 0%, #2EE0C9 55%, #2DA8FF 100%)',
                  boxShadow: '0 10px 28px rgba(46,224,201,0.35)',
                }}
              >
                <Crown className="w-4 h-4" />
                {t('paywall.cta_upgrade', { defaultValue: 'Jetzt upgraden' })}
              </Link>
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-foam/60 hover:text-foam transition-colors"
              >
                {t('paywall.cta_later', { defaultValue: 'Später' })}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Benefit({ text }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-mint-400/15 border border-mint-400/30">
        <Check className="w-3 h-3 text-mint-400" strokeWidth={3} />
      </div>
      <span className="text-sm text-foam/85">{text}</span>
    </div>
  );
}