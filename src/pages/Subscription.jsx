import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Anchor, Check, ExternalLink, Smartphone, Monitor, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageTransition from '../components/ui/PageTransition';
import PromoCodeRedeemer from '../components/subscription/PromoCodeRedeemer';
import BillingToggle from '../components/subscription/BillingToggle';
import LifetimeDealBanner from '../components/subscription/LifetimeDealBanner';

// ── Price data ──────────────────────────────────────────────────────────────
const PLAN_META = {
  angler: {
    monthly: { price: '4,99', period: '/Mo', priceId: 'price_1TN9RXGoVmyTT5LjvgDEhhHI' },
    annual:  { price: '49,99', period: '/Jahr', priceId: 'price_1TN9RXGoVmyTT5Lj1YHtz6Ql' },
  },
  pro: {
    monthly: { price: '9,99', period: '/Mo', priceId: 'price_1TN9RXGoVmyTT5LjGSQelTei' },
    annual:  { price: '99,99', period: '/Jahr', priceId: 'price_1TN9RXGoVmyTT5LjwaSzO1nf' },
  },
  legend: {
    monthly: { price: '19,99', period: '/Mo', priceId: 'price_1TN9RXGoVmyTT5LjBvUVQ92s' },
    annual:  { price: '199,99', period: '/Jahr', priceId: 'price_1TN9RXGoVmyTT5LjjgtieE3I' },
  },
};

const PLAN_LABELS = { free: 'Free', angler: 'Angler', pro: 'Pro', legend: 'Legend' };

const getPlans = (t) => [
  {
    key: 'free',
    features: [t('subscription.features.free_1'), t('subscription.features.free_2'), t('subscription.features.free_3')],
    highlight: false,
  },
  {
    key: 'angler',
    features: [t('subscription.features.angler_1'), t('subscription.features.angler_2'), t('subscription.features.angler_3'), t('subscription.features.angler_4')],
    highlight: false,
  },
  {
    key: 'pro',
    features: [t('subscription.features.pro_1'), t('subscription.features.pro_2'), t('subscription.features.pro_3'), t('subscription.features.pro_4'), t('subscription.features.pro_5'), t('subscription.features.pro_6')],
    highlight: true,
  },
  {
    key: 'legend',
    features: [t('subscription.features.legend_1'), t('subscription.features.legend_2'), t('subscription.features.legend_3'), t('subscription.features.legend_4'), t('subscription.features.legend_5'), t('subscription.features.legend_6')],
    highlight: false,
  },
];

function detectPlatform() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'web';
}

const localeTag = (code) => {
  const map = { de: 'de-DE', en: 'en-US', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', hr: 'hr-HR', pt: 'pt-PT', nl: 'nl-NL', tr: 'tr-TR', el: 'el-GR', sq: 'sq-AL' };
  return map[code] || 'de-DE';
};

// Lifetime tier price IDs (from stripeWebhook PRICE_MAP)
const LIFETIME_PRICE_IDS = {
  1: 'price_1TN9RXGoVmyTT5LjPL7V4IpL',
  2: 'price_1TN9RXGoVmyTT5LjBaSEiv3H',
  3: 'price_1TN9RXGoVmyTT5Lj2rDAWpxg',
  4: 'price_1TN9RXGoVmyTT5LjZbPBYkVg',
};

export default function Subscription() {
  const { t, i18n } = useTranslation();
  const PLANS = React.useMemo(() => getPlans(t), [t]);
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const platform = detectPlatform();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') setSuccessMsg('🎉 Zahlung erfolgreich! Dein Plan wurde aktiviert.');
    if (params.get('cancelled') === 'true') setSuccessMsg('Checkout wurde abgebrochen.');
  }, []);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.HookPointsTransaction.filter({ type: 'premium_unlock' }, '-created_date', 20),
    ]).then(([u, txs]) => { setUser(u); setTransactions(txs); }).finally(() => setLoading(false));
  }, []);

  const currentPlan = user?.premium_plan || 'free';
  const expires = user?.premium_expires ? new Date(user.premium_expires).toLocaleDateString(localeTag(i18n.language)) : null;
  const hookPoints = user?.hook_points ?? 0;

  const handleUpgrade = async (planKey, lifetimeTier = null) => {
    if (platform === 'ios') { alert(t('subscription.alert_ios')); return; }
    if (platform === 'android') { alert(t('subscription.alert_android')); return; }
    if (window.self !== window.top) {
      alert('Checkout is only available in the published app, not in preview mode.');
      return;
    }

    const loadingKey = lifetimeTier ? `lifetime_${lifetimeTier}` : `${planKey}_${billingCycle}`;
    setCheckoutLoading(loadingKey);

    try {
      const origin = window.location.origin;
      const payload = {
        successUrl: `${origin}/subscription?success=true`,
        cancelUrl: `${origin}/subscription?cancelled=true`,
      };

      if (planKey === 'lifetime' && lifetimeTier) {
        payload.plan = 'lifetime';
        payload.cycle = 'lifetime';
        payload.lifetimeTier = lifetimeTier;
        payload.priceId = LIFETIME_PRICE_IDS[lifetimeTier];
      } else {
        payload.plan = planKey;
        payload.cycle = billingCycle;
        payload.priceId = PLAN_META[planKey]?.[billingCycle]?.priceId;
      }

      const res = await base44.functions.invoke('stripeCheckout', payload);
      if (res.data?.url) window.location.href = res.data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Could not start checkout. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-8 space-y-6">

        {/* Header */}
        <div>
          <p className="text-foam/50 text-sm">{t('subscription.title')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('subscription.title')}</h1>
        </div>

        {/* Status card */}
        {user && (
          <div className="glass-card rounded-3xl p-5 space-y-4" style={{ border: '1px solid rgba(245,195,75,0.2)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
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
                <p className="text-sun-400 font-display font-bold text-lg">{hookPoints.toLocaleString(localeTag(i18n.language))}</p>
                <p className="text-foam/40 text-xs">HookPoints</p>
              </div>
              <div className="glass-card rounded-xl p-3 text-center">
                <p className="text-tide-400 font-display font-bold text-sm">{expires || '∞'}</p>
                <p className="text-foam/40 text-xs">{t('subscription.expires')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success / cancel banner */}
        {successMsg && (
          <div className="glass-card rounded-2xl p-4 text-center text-foam font-semibold text-sm border border-tide-400/30">
            {successMsg}
          </div>
        )}

        {/* ── 1. Lifetime Deal (tiered) ── */}
        <div className="rounded-2xl p-4"
          style={{ background: 'linear-gradient(135deg, rgba(182,240,60,0.08) 0%, rgba(45,168,255,0.06) 100%)', border: '1.5px solid rgba(182,240,60,0.25)' }}>
          <LifetimeDealBanner onBuy={handleUpgrade} checkoutLoading={checkoutLoading} />
        </div>

        {/* ── 2. Billing toggle ── */}
        <BillingToggle cycle={billingCycle} onChange={setBillingCycle} />

        {/* ── Pricing cards ── */}
        <div className="space-y-3">
          {PLANS.map((plan, i) => {
            const isCurrent = currentPlan === plan.key;
            const meta = PLAN_META[plan.key]?.[billingCycle];
            const price = meta?.price ?? '0';
            const period = meta ? meta.period : '';
            const loadingKey = `${plan.key}_${billingCycle}`;

            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl p-4 space-y-3"
                style={plan.highlight
                  ? { background: 'linear-gradient(135deg, rgba(31,167,184,0.15) 0%, rgba(245,195,75,0.12) 100%)', border: '1.5px solid rgba(245,195,75,0.4)', boxShadow: '0 0 20px rgba(245,195,75,0.12)' }
                  : { background: 'rgba(7,38,55,0.55)', backdropFilter: 'blur(20px)', border: '1px solid rgba(127,220,229,0.1)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-display font-extrabold text-lg ${plan.highlight ? 'text-sun-400' : 'text-foam'}`}>
                        {PLAN_LABELS[plan.key]}
                      </h3>
                      {plan.highlight && (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-sun-400/20 text-sun-300">
                          {t('subscription.popular')}
                        </span>
                      )}
                      {billingCycle === 'annual' && plan.key !== 'free' && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-lime2/20 text-lime2 border border-lime2/30">
                          Spare 17%
                        </span>
                      )}
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-tide-500/20 text-tide-300">
                          {t('subscription.current')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className={`font-display font-extrabold text-2xl ${plan.highlight ? 'text-sun-400' : 'text-foam'}`}>
                        {plan.key === 'free' ? 'Kostenlos' : `€${price}`}
                      </span>
                      {period && <span className="text-foam/40 text-sm">{period}</span>}
                    </div>
                  </div>

                  {!isCurrent && plan.key !== 'free' && (
                    <button
                      onClick={() => handleUpgrade(plan.key)}
                      disabled={checkoutLoading === loadingKey}
                      className={`px-4 py-2 rounded-xl text-sm font-bold flex-shrink-0 disabled:opacity-60 ${plan.highlight ? 'gradient-tide text-white glow-tide' : 'glass-card border border-tide-400/30 text-tide-300'}`}
                    >
                      {checkoutLoading === loadingKey ? '…' : t('subscription.upgrade')}
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

        {/* ── 3. Promo Code ── */}
        {user && (
          <PromoCodeRedeemer
            userEmail={user.email}
            onSuccess={(plan) => setSuccessMsg(`✅ Plan "${plan}" wurde per Promo-Code aktiviert!`)}
          />
        )}

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
                  <p className="text-foam/40 text-xs">{tx.created_date ? new Date(tx.created_date).toLocaleDateString(localeTag(i18n.language)) : ''}</p>
                </div>
                <p className={`font-display font-bold text-sm ${tx.amount > 0 ? 'text-sun-400' : 'text-coral-500'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} HP
                </p>
              </div>
            ))}
          </div>
        )}

        {/* HookPoints Shop link */}
        <Link to="/hookpoints-shop">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3 border border-lime2/20 hover:border-lime2/40 transition-colors">
            <span className="text-2xl">🪝</span>
            <div className="flex-1">
              <p className="text-foam font-bold text-sm">HookPoints Shop</p>
              <p className="text-muted2 text-xs">HP kaufen &amp; Prämien einlösen</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted2" />
          </div>
        </Link>

        {/* Cancel link */}
        <div className="text-center">
          <a href="#cancel" className="text-foam/30 text-xs underline"
            onClick={e => { e.preventDefault(); alert(t('subscription.alert_billing')); }}>
            {t('subscription.cancel')}
          </a>
        </div>

      </div>
    </PageTransition>
  );
}