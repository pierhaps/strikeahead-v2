import { useAuth } from '../lib/AuthContext';

const PREMIUM_PLANS = ['angler', 'pro', 'legend'];

/**
 * Returns { isPremium, isAdmin, loading, user }
 * isPremium — true if user has any paid plan (angler / pro / legend)
 * isAdmin   — true if user.role === 'admin'
 */
export function usePremiumCheck() {
  const { user, isLoadingAuth } = useAuth();

  const plan = user?.plan || user?.subscription_plan || user?.premium_plan || '';
  const isPremium = PREMIUM_PLANS.includes(plan) ||
    (user?.premium_expires_at && new Date(user.premium_expires_at) > new Date()) ||
    (user?.premium_expires && new Date(user.premium_expires) > new Date()) ||
    (user?.is_premium === true);
  const isAdmin = user?.role === 'admin';

  return { isPremium, isAdmin, loading: isLoadingAuth, user };
}