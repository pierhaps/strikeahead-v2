import React, { useState } from 'react';
import { Tag, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PLAN_LABELS = { angler: 'Angler', pro: 'Pro', legend: 'Legend' };

export default function PromoCodeRedeemer({ userEmail, onSuccess }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const redeem = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setStatus('loading');
    setMessage('');

    try {
      // Look up the promo code
      const results = await base44.entities.PromoCode.filter({ code: trimmed });
      const promo = results[0];

      if (!promo) {
        setStatus('error');
        setMessage('Ungültiger Code. Bitte überprüfe die Eingabe.');
        return;
      }
      if (!promo.active) {
        setStatus('error');
        setMessage('Dieser Code ist nicht mehr aktiv.');
        return;
      }
      if (promo.expires_date && new Date(promo.expires_date) < new Date()) {
        setStatus('error');
        setMessage('Dieser Code ist abgelaufen.');
        return;
      }
      if (promo.times_used >= promo.max_uses) {
        setStatus('error');
        setMessage('Dieser Code wurde bereits vollständig eingelöst.');
        return;
      }

      // Check if user already used this code
      const existing = await base44.entities.PromoRedemption.filter({ code: trimmed, user_email: userEmail });
      if (existing.length > 0) {
        setStatus('error');
        setMessage('Du hast diesen Code bereits verwendet.');
        return;
      }

      // Calculate expiry
      let expiresDate = null;
      if (promo.duration_days) {
        const d = new Date();
        d.setDate(d.getDate() + promo.duration_days);
        expiresDate = d.toISOString();
      }

      // Update user plan
      const users = await base44.entities.User.filter({ email: userEmail });
      if (users.length > 0) {
        await base44.auth.updateMe({
          premium_plan: promo.grants_plan,
          billing_cycle: promo.duration_days ? 'monthly' : 'lifetime',
          ...(expiresDate ? { premium_expires: expiresDate } : {}),
        });
      }

      // Create redemption record
      await base44.entities.PromoRedemption.create({
        code: trimmed,
        user_email: userEmail,
        redeemed_date: new Date().toISOString(),
        grants_plan: promo.grants_plan,
        expires_date: expiresDate,
      });

      // Increment times_used
      await base44.entities.PromoCode.update(promo.id, { times_used: (promo.times_used || 0) + 1 });

      const planLabel = PLAN_LABELS[promo.grants_plan] || promo.grants_plan;
      const durationText = promo.duration_days ? `für ${promo.duration_days} Tage` : 'dauerhaft';
      setStatus('success');
      setMessage(`🎉 Aktiviert! ${planLabel}-Plan ${durationText} freigeschaltet.`);
      setCode('');
      if (onSuccess) onSuccess(promo.grants_plan);
    } catch (err) {
      console.error('Promo redeem error:', err);
      setStatus('error');
      setMessage('Fehler beim Einlösen. Bitte versuche es erneut.');
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-tide-400" />
        <h3 className="text-foam font-bold text-sm">Promo Code einlösen</h3>
      </div>

      <div className="flex gap-2">
        <input
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setStatus(null); }}
          onKeyDown={e => e.key === 'Enter' && redeem()}
          placeholder="z.B. ANDRE-FRIEND-01"
          disabled={status === 'loading'}
          className="flex-1 bg-abyss-800 border border-tide-400/20 rounded-xl px-3 py-2.5 text-foam placeholder-foam/30 text-sm outline-none focus:border-tide-400/50 font-mono tracking-wide disabled:opacity-50"
        />
        <button
          onClick={redeem}
          disabled={status === 'loading' || !code.trim()}
          className="px-4 py-2.5 rounded-xl gradient-tide text-white text-sm font-bold disabled:opacity-50 flex items-center gap-1.5"
        >
          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Einlösen'}
        </button>
      </div>

      {message && (
        <div className={`flex items-start gap-2 text-sm rounded-xl p-3 ${status === 'success' ? 'bg-tide-500/10 text-tide-300' : 'bg-red-500/10 text-red-400'}`}>
          {status === 'success'
            ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}