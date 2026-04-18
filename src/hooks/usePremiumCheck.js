import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const PREMIUM_PLANS = ['angler', 'pro', 'legend'];

/**
 * Returns { isPremium, isAdmin, loading }
 * isPremium — true if user has any paid plan (angler / pro / legend)
 * isAdmin   — true if user.role === 'admin'
 */
export function usePremiumCheck() {
  const [state, setState] = useState({ isPremium: false, isAdmin: false, loading: true });

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        if (!user) { setState({ isPremium: false, isAdmin: false, loading: false }); return; }
        const plan = user.plan || user.subscription_plan || '';
        const isPremium = PREMIUM_PLANS.includes(plan) ||
          (user.premium_expires_at && new Date(user.premium_expires_at) > new Date());
        const isAdmin = user.role === 'admin';
        setState({ isPremium, isAdmin, loading: false });
      })
      .catch(() => setState({ isPremium: false, isAdmin: false, loading: false }));
  }, []);

  return state;
}