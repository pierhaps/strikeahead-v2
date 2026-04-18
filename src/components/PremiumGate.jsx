import React from 'react';
import { Lock, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePremiumCheck } from '../hooks/usePremiumCheck';

/**
 * PremiumGate — hard-gates an entire page behind a paywall.
 * If the user is premium or admin, renders children as-is.
 * Otherwise, shows a full-screen upgrade prompt.
 *
 * Props:
 *   feature  — string, localized feature name to display
 *   children — page content to protect
 */
export default function PremiumGate({ feature, children }) {
  const { isPremium, isAdmin, loading } = usePremiumCheck();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isPremium || isAdmin) return children;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(182,240,60,0.15), rgba(46,224,201,0.10))',
          border: '1px solid rgba(182,240,60,0.30)',
          boxShadow: '0 0 40px rgba(46,224,201,0.15)',
        }}
      >
        <Lock className="w-9 h-9 text-lime2" />
      </div>

      <h2 className="font-display text-2xl font-extrabold text-foam mb-2">{feature}</h2>
      <p className="text-foam/50 text-sm mb-8 max-w-xs leading-relaxed">
        Dieses Feature ist exklusiv für Premium-Mitglieder verfügbar.
      </p>

      <button
        onClick={() => navigate('/subscription')}
        className="flex items-center gap-2 px-8 py-4 rounded-2xl font-display font-bold text-navy-900 text-base"
        style={{
          background: 'linear-gradient(225deg, #B6F03C 0%, #2EE0C9 55%, #2DA8FF 100%)',
          boxShadow: '0 10px 32px rgba(46,224,201,0.35)',
        }}
      >
        <Crown className="w-5 h-5" />
        Jetzt upgraden
      </button>

      <button
        onClick={() => window.history.back()}
        className="mt-4 text-foam/40 text-sm"
      >
        Zurück
      </button>
    </div>
  );
}