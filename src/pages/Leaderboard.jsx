import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Anchor, Fish, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import PageTransition from '../components/ui/PageTransition';

const TABS = ['leaderboard_global','leaderboard_region','leaderboard_friends','leaderboard_team','leaderboard_crew'];
const SORTS = [
  { key: 'fish_xp', label: 'XP', icon: TrendingUp },
  { key: 'hook_points', label: 'HP', icon: Anchor },
  { key: 'total_catches', label: 'Fänge', icon: Fish },
];

export default function Leaderboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('leaderboard_global');
  const [sortKey, setSortKey] = useState('fish_xp');
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([base44.auth.me(), base44.entities.User.list(`-${sortKey}`, 100)])
      .then(([u, us]) => { setMe(u); setUsers(us); })
      .finally(() => setLoading(false));
  }, [sortKey]);

  const myRank = users.findIndex(u => u.email === me?.email) + 1;
  const myScore = me?.[sortKey] ?? 0;

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div>
          <p className="text-foam/50 text-sm">{t('community.leaderboard')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('community.leaderboard')}</h1>
        </div>

        {/* Tab scroll */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {TABS.map(k => (
            <button key={k} onClick={() => setTab(k)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${tab === k ? 'gradient-tide text-white' : 'glass-card text-foam/50'}`}>
              {t(`community.${k}`)}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          {SORTS.map(s => (
            <button key={s.key} onClick={() => setSortKey(s.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${sortKey === s.key ? 'bg-tide-500/20 text-tide-300 border border-tide-400/30' : 'glass-card text-foam/40'}`}>
              <s.icon className="w-3 h-3" />
              {s.label}
            </button>
          ))}
        </div>

        {/* My rank */}
        {me && myRank > 0 && (
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-sun-500/20"
            style={{ background: 'rgba(245,195,75,0.06)' }}>
            <div className="w-11 h-11 rounded-2xl gradient-tide flex items-center justify-center font-display font-bold text-white text-lg">
              #{myRank}
            </div>
            <div className="flex-1">
              <p className="text-foam font-bold text-sm">{me.full_name} (Du)</p>
              <p className="text-foam/40 text-xs">{myScore.toLocaleString('de-DE')} {sortKey === 'fish_xp' ? 'XP' : sortKey === 'hook_points' ? 'HP' : 'Fänge'}</p>
            </div>
            <Trophy className="w-5 h-5 text-sun-400" />
          </div>
        )}

        {loading ? (
          <div className="text-center py-12"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-16"><p className="text-foam/50">{t('community.leaderboard_empty')}</p></div>
        ) : (
          <div className="space-y-2">
            {users.slice(0, 100).map((u, i) => {
              const isMe = u.email === me?.email;
              const rank = i + 1;
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
              return (
                <motion.div key={u.id || u.email} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                  className={`glass-card rounded-xl px-4 py-3 flex items-center gap-3 ${isMe ? 'border border-tide-400/30' : ''}`}>
                  <div className={`w-8 text-center font-display font-bold text-sm ${rank <= 3 ? 'text-sun-400' : 'text-foam/40'}`}>
                    {medal || `#${rank}`}
                  </div>
                  <div className="w-8 h-8 rounded-xl gradient-tide flex items-center justify-center text-sm text-white font-bold flex-shrink-0">
                    {u.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isMe ? 'text-tide-300' : 'text-foam'}`}>{u.full_name || u.email}</p>
                  </div>
                  <p className="text-foam font-display font-bold text-sm">{(u[sortKey] || 0).toLocaleString('de-DE')}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}