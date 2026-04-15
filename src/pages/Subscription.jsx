import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Anchor, Check, ExternalLink, Smartphone, Monitor, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageTransition from '../components/ui/PageTransition';

const PLANS = [
  {
    key: 'free', price: '0', period: '',
    features: ['5 Fänge/Monat', 'Basis-Karte', 'Community-Feed'],
    highlight: false,
  },
  {
    key: 'angler', price: '4,99', period: '/Mo',
    features: ['Unbegrenzte Fänge', 'Alle Karten-Layer', 'Wettkampf-Teilnahme', 'Basis-Analytics'],
    highlight: false,
  },
  {
    key: 'pro', price: '9,99', period: '/Mo',
    features: ['Alles in Angler', 'KI-Fischidentifikation', 'Forecast & Solunar', 'Skill-Profil', 'Coach-Zugang', '500 HP/Mo Bonus'],
    highlight: true,
  },
  {
    key: 'legend', price: '19,99', period: '/Mo',
    features: ['Alles in Pro', 'Legend-Badge', 'Exklusive Turniere', '2000 HP/Mo Bonus', 'Direkter Support', 'Beta-Features'],
    highlight: false,
  },
];

const PLAN_LABELS = { free: 'Free', angler: 'Angler', pro: 'Pro', legend: 'Legend' };

function detectPlatform() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'web';
}

export default function Subscription() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const platform = detectPlatform();

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.HookPointsTransaction.filter({ type: 'premium_unlock' }, '-created_date', 20),
    ]).then(([u, txs]) => { setUser(u); setTransactions(txs); }).finally(() => setLoading(false));
  }, []);

  const currentPlan = user?.premium_plan || 'free';
  const expires = user?.premium_expires ? new Date(user.premium_expires).toLocaleDateString('de-DE') : null;
  const hookPoints = user?.hook_points ?? 0;

  const handleUpgrade = (planKey) => {
    if (platform === 'web') {
      alert('Stripe Checkout wird geöffnet… (Platzhalter-Integration)');
    } else if (platform === 'ios') {
      alert('Bitte öffne die iOS-App für In-App-Käufe.');
    } else {
      alert('Bitte öffne die Android-App für In-App-Käufe.');
    }
  };

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-8 space-y-6">
        <div>
          <p className="text-foam/50 text-sm">{t('subscription.title')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('subscription.title')}</h1>
        </div>

        {/* Status card */}
        {user && (
          <div className="glass-card rounded-3xl p-5 space-y-4" style={{ border: '1px solid rgba(245,195,75,0.2)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: 'rgba(245,195,75,0.15)', border: '1px solid rgba(245,195,75,0.3)' }}>
                <Crown className="w-6 h-6 text-sun-400" />
              </div>
              <div>
                <p className="text-foam/50 text-xs">{t('subscription.current_plan')}</p>
                <p className="font-display font-extrabold text-xl text-sun-400">{PLAN_LABELS[currentPlan] || 'Free'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-xl p-3 text-center">
                <p className="text-sun-400 font-display font-bold text-lg">{hookPoints.toLocaleString('de-DE')}</p>
                <p className="text-foam/40 text-xs">HookPoints</p>
              </div>
              <div className="glass-card rounded-xl p-3 text-center">
                <p className="text-tide-400 font-display font-bold text-sm">{expires || '∞'}</p>
                <p className="text-foam/40 text-xs">{t('subscription.expires')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing cards */}
        <div className="space-y-3">
          {PLANS.map((plan, i) => {
            const isCurrent = currentPlan === plan.key;
            return (
              <motion.div key={plan.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="rounded-2xl p-4 space-y-3"
                style={plan.highlight
                  ? { background: 'linear-gradient(135deg, rgba(31,167,184,0.15) 0%, rgba(245,195,75,0.12) 100%)', border: '1.5px solid rgba(245,195,75,0.4)', boxShadow: '0 0 20px rgba(245,195,75,0.12)' }
                  : { background: 'rgba(7,38,55,0.55)', backdropFilter: 'blur(20px)', border: '1px solid rgba(127,220,229,0.1)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-display font-extrabold text-lg ${plan.highlight ? 'text-sun-400' : 'text-foam'}`}>{PLAN_LABELS[plan.key]}</h3>
                      {plan.highlight && <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-sun-400/20 text-sun-300">Beliebt</span>}
                      {isCurrent && <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-tide-500/20 text-tide-300">{t('subscription.current')}</span>}
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className={`font-display font-extrabold text-2xl ${plan.highlight ? 'text-sun-gradient' : 'text-foam'}`}>€{plan.price}</span>
                      <span className="text-foam/40 text-sm">{plan.period}</span>
                    </div>
                  </div>
                  {!isCurrent && plan.key !== 'free' && (
                    <button onClick={() => handleUpgrade(plan.key)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold flex-shrink-0 ${plan.highlight ? 'gradient-tide text-white glow-tide' : 'glass-card border border-tide-400/30 text-tide-300'}`}>
                      {t('subscription.upgrade')}
                    </button>
                  )}
                </div>
                <ul className="space-y-1.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 ${plan.highlight ? 'text-sun-400' : 'text-tide-400'}`} />
                      <span className="text-foam/70">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Platform checkout info */}
        <div className="glass-card rounded-2xl p-4 space-y-3">
          <h3 className="text-foam font-bold flex items-center gap-2">
            {platform === 'ios' ? <Smartphone className="w-4 h-4 text-tide-400" /> : platform === 'android' ? <ShoppingBag className="w-4 h-4 text-tide-400" /> : <Monitor className="w-4 h-4 text-tide-400" />}
            {t('subscription.checkout_title')}
          </h3>
          <p className="text-foam/50 text-sm">
            {platform === 'web' && t('subscription.checkout_web')}
            {platform === 'ios' && t('subscription.checkout_ios')}
            {platform === 'android' && t('subscription.checkout_android')}
          </p>
        </div>

        {/* Transaction history */}
        {transactions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-foam/50 text-xs uppercase tracking-widest">{t('subscription.history')}</h3>
            {transactions.map(tx => (
              <div key={tx.id} className="glass-card rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-foam text-sm font-semibold">{tx.description}</p>
                  <p className="text-foam/40 text-xs">{tx.created_date ? new Date(tx.created_date).toLocaleDateString('de-DE') : ''}</p>
                </div>
                <p className={`font-display font-bold text-sm ${tx.amount > 0 ? 'text-sun-400' : 'text-coral-500'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} HP
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Cancel link */}
        <div className="text-center">
          <a href="#cancel" className="text-foam/30 text-xs underline" onClick={e => { e.preventDefault(); alert('Billing-Portal (Platzhalter)'); }}>
            {t('subscription.cancel')}
          </a>
        </div>
      </div>
    </PageTransition>
  );
}