import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const TYPE_ICONS = {
  purchase: '💳',
  spend:    '🎁',
  earn:     '⭐',
  bonus:    '🎉',
  refund:   '↩️',
};

export default function TransactionHistory({ transactions }) {
  if (!transactions.length) {
    return (
      <div className="text-center py-8 text-muted2 text-sm">
        Noch keine Transaktionen
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center gap-3 glass-subtle rounded-xl px-4 py-3"
        >
          <span className="text-lg w-6 text-center flex-shrink-0">{TYPE_ICONS[tx.type] || '🔄'}</span>

          <div className="flex-1 min-w-0">
            <p className="text-foam text-sm font-medium truncate">{tx.description}</p>
            <p className="text-muted2 text-xs">
              {tx.created_date
                ? new Date(tx.created_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '—'}
            </p>
          </div>

          <div className={`flex items-center gap-1 font-bold text-sm flex-shrink-0 ${tx.amount > 0 ? 'text-lime2' : 'text-coral-400'}`}>
            {tx.amount > 0
              ? <ArrowUpRight className="w-4 h-4" />
              : <ArrowDownLeft className="w-4 h-4" />
            }
            {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} HP
          </div>
        </div>
      ))}
    </div>
  );
}