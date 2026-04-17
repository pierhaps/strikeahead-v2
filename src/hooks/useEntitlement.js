import { useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';

/**
 * Admin accounts (bypass all paywalls & feature gates).
 * Matched case-insensitively.
 */
const ADMIN_EMAILS = [
  'kremmer.andre@googlemail.com',
  'yiannispatani@live.nl',
];

/**
 * Feature → required tier mapping.
 * Tiers (ascending):  free < angler < pro < legend
 * Premium = anything above 'free'.
 */
const FEATURE_TIER = {
  // free
  catch_log:         'free',
  basic_map:         'free',
  basic_profile:     'free',
  license_search:    'free',

  // angler
  strike_score:      'angler',
  bait_intelligence: 'angler',
  catch_forecast:    'angler',
  diary:             'angler',

  // pro
  heatmap:           'pro',
  statistics_pro:    'pro',
  bait_database:     'pro',
  analytics:         'pro',
  ai_insights:       'pro',

  // legend
  ai_coach:          'legend',
  tournaments:       'legend',
  unlimited_entries: 'legend',
};

const TIER_RANK = { free: 0, angler: 1, pro: 2, legend: 3 };

function planToTier(plan) {
  if (!plan) return 'free';
  const p = String(plan).toLowerCase();
  if (TIER_RANK[p] !== undefined) return p;
  // tolerate legacy aliases
  if (p === 'premium' || p === 'plus') return 'pro';
  return 'free';
}

/**
 * useEntitlement — central gate for premium features.
 *
 * Returns:
 *   user           — from AuthContext
 *   tier           — 'free' | 'angler' | 'pro' | 'legend'
 *   isPremium      — boolean (any tier > free)
 *   isAdmin        — boolean (email in ADMIN_EMAILS)
 *   canAccess(key) — boolean, admin bypass
 *   requiredTier(k)→ tier string (for paywall CTA)
 */
export function useEntitlement() {
  const { user } = useAuth();

  return useMemo(() => {
    const email = (user?.email || '').toLowerCase();
    const isAdmin = user?.role === 'admin' || ADMIN_EMAILS.includes(email);
    const tier = planToTier(user?.premium_plan);
    const userRank = TIER_RANK[tier] ?? 0;
    const isPremium = isAdmin || userRank > 0;

    const requiredTier = (featureKey) => FEATURE_TIER[featureKey] || 'free';

    const canAccess = (featureKey) => {
      if (isAdmin) return true;
      const need = FEATURE_TIER[featureKey] || 'free';
      return userRank >= (TIER_RANK[need] ?? 0);
    };

    return {
      user,
      tier,
      isPremium,
      isAdmin,
      canAccess,
      requiredTier,
    };
  }, [user]);
}

export { ADMIN_EMAILS, FEATURE_TIER, TIER_RANK };