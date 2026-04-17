import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ShoppingBag, Gift } from 'lucide-react';
import HpBalanceHeader from '../components/hookpoints/HpBalanceHeader';
import PackageCard from '../components/hookpoints/PackageCard';
import RewardCard from '../components/hookpoints/RewardCard';
import TransactionHistory from '../components/hookpoints/TransactionHistory';

const isInIframe = () => {
  try { return window.self !== window.top; } catch { return true; }
};

export default function HookPointsShop() {
  const [user, setUser] = useState(null);
  const [packages, setPackages] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [redeemingId, setRedeemingId] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg: string }

  // Check URL params for success/cancel
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === '1') {
      showToast('success', '🎉 Zahlung erfolgreich! Deine HookPoints wurden gutgeschrieben.');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('cancelled') === '1') {
      showToast('error', 'Zahlung abgebrochen.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [me, pkgs, rwds] = await Promise.all([
        base44.auth.me(),
        base44.entities.HookPointPackage.filter({ active: true }, 'sort_order', 10),
        base44.entities.HookPointReward.filter({ active: true }, 'sort_order', 10),
      ]);
      setUser(me);
      setPackages(pkgs);
      setRewards(rwds);

      if (me?.email) {
        const txs = await base44.entities.HookPointTransaction.filter(
          { user_email: me.email }, '-created_date', 10
        );
        setTransactions(txs);
      }
    } catch (err) {
      console.error('Load error:', err);
    }
    setLoading(false);
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleBuy = async (pkg) => {
    if (isInIframe()) {
      alert('Der Kauf funktioniert nur in der veröffentlichten App, nicht in der Vorschau.');
      return;
    }
    setBuyingId(pkg.id);
    try {
      const res = await base44.functions.invoke('hookpointsCheckout', {
        package_id: pkg.id,
        success_url: `${window.location.origin}/hookpoints-shop?success=1`,
        cancel_url: `${window.location.origin}/hookpoints-shop?cancelled=1`,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        showToast('error', 'Fehler beim Öffnen des Checkouts.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      showToast('error', 'Checkout konnte nicht gestartet werden.');
    }
    setBuyingId(null);
  };

  const handleRedeem = async (reward) => {
    const currentHp = user?.hook_points || 0;
    if (currentHp < reward.cost_hp) return;

    setRedeemingId(reward.id);
    try {
      const newBalance = currentHp - reward.cost_hp;

      // Apply reward
      const updateData = { hook_points: newBalance };
      if (reward.reward_type === 'temp_premium' && reward.grants_plan && reward.duration_hours) {
        const expiresAt = new Date(Date.now() + reward.duration_hours * 3600 * 1000).toISOString();
        updateData.premium_plan = reward.grants_plan;
        updateData.premium_expires = expiresAt;
      }
      await base44.auth.updateMe(updateData);

      // Record transaction
      await base44.entities.HookPointTransaction.create({
        user_email: user.email,
        type: 'spend',
        amount: -reward.cost_hp,
        balance_after: newBalance,
        description: `${reward.name} eingelöst`,
      });

      setUser(prev => ({ ...prev, hook_points: newBalance, ...updateData }));

      // Refresh transactions
      const txs = await base44.entities.HookPointTransaction.filter(
        { user_email: user.email }, '-created_date', 10
      );
      setTransactions(txs);

      showToast('success', `✅ „${reward.name}" wurde aktiviert!`);
    } catch (err) {
      console.error('Redeem error:', err);
      showToast('error', 'Einlösen fehlgeschlagen. Bitte erneut versuchen.');
    }
    setRedeemingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userHp = user?.hook_points || 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-floating font-semibold text-sm max-w-sm text-center
              ${toast.type === 'success' ? 'bg-tide-500/90 text-white' : 'bg-coral-500/90 text-white'}`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-xl mx-auto px-4 pt-6 space-y-8">
        {/* Balance */}
        <HpBalanceHeader balance={userHp} />

        {/* Buy Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-cyan2" />
            <h2 className="text-foam font-bold text-lg">HookPoints kaufen</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onBuy={handleBuy}
                buying={buyingId === pkg.id}
              />
            ))}
          </div>
          <p className="text-xs text-muted2 mt-3 text-center">
            Sichere Zahlung via Stripe · Sofortige Gutschrift
          </p>
        </section>

        {/* Redeem Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-lime2" />
            <h2 className="text-foam font-bold text-lg">HookPoints einlösen</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                userHp={userHp}
                onRedeem={handleRedeem}
                redeeming={redeemingId === reward.id}
              />
            ))}
          </div>
        </section>

        {/* Transaction History */}
        <section>
          <h2 className="text-foam font-bold text-base mb-3 flex items-center gap-2">
            <span className="text-lg">📋</span> Transaktionen
          </h2>
          <div className="glass-card rounded-2xl p-4">
            <TransactionHistory transactions={transactions} />
          </div>
        </section>
      </div>
    </div>
  );
}