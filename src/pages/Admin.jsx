import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Fish, Shield, Database, Trophy, BarChart2, Search, AlertTriangle, Trash2, Edit3, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import PageTransition from '../components/ui/PageTransition';
import PromoCodeAdmin from '../components/admin/PromoCodeAdmin';

const SECTION_KEYS = [
  { key: 'reports',      icon: BarChart2 },
  { key: 'users',        icon: Users },
  { key: 'catches',      icon: Fish },
  { key: 'moderation',   icon: Shield },
  { key: 'entities',     icon: Database },
  { key: 'competitions', icon: Trophy },
  { key: 'promo',        icon: Tag },
];

export default function Admin() {
  const { t, i18n } = useTranslation();
  const SECTIONS = React.useMemo(() => SECTION_KEYS.map(s => ({
    ...s,
    label: t(`admin.section_${s.key}`, { defaultValue: s.key[0].toUpperCase() + s.key.slice(1) }),
  })), [t]);
  const [user, setUser] = useState(null);
  const [section, setSection] = useState('reports');
  const [users, setUsers] = useState([]);
  const [catches, setCatches] = useState([]);
  const [mods, setMods] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({ totalUsers: 0, totalCatches: 0, totalMods: 0 });

  useEffect(() => {
    base44.auth.me().then(u => setUser(u));
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    const loaders = {
      reports: () => Promise.all([
        base44.entities.User.list('-created_date', 5),
        base44.entities.Catch.list('-created_date', 5),
        base44.entities.ChatModeration.list(),
      ]).then(([us, cs, ms]) => setMetrics({ totalUsers: us.length, totalCatches: cs.length, totalMods: ms.length })),
      users: () => base44.entities.User.list('-created_date', 100).then(setUsers),
      catches: () => base44.entities.Catch.list('-created_date', 50).then(setCatches),
      moderation: () => base44.entities.ChatModeration.list('-warning_level', 50).then(setMods),
      entities: () => Promise.resolve(),
      competitions: () => Promise.resolve(),
    };
    (loaders[section] || (() => Promise.resolve()))().finally(() => setLoading(false));
  }, [section, user]);

  if (!user) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" /></div>;
  if (user.role !== 'admin') return (
    <PageTransition>
      <div className="px-4 pt-20 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <p className="text-foam font-bold">{t('admin.no_access')}</p>
      </div>
    </PageTransition>
  );

  const filteredUsers = users.filter(u => u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  const escalateMod = async (mod) => {
    const newLevel = Math.min((mod.warning_level || 0) + 1, 3);
    await base44.entities.ChatModeration.update(mod.id, { warning_level: newLevel });
    setMods(prev => prev.map(m => m.id === mod.id ? { ...m, warning_level: newLevel } : m));
  };

  return (
    <PageTransition>
      <div className="pt-6 pb-8">
        <div className="px-4 mb-5">
          <p className="text-foam/50 text-sm">{t('admin.title')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('admin.title')} ⚙️</h1>
        </div>

        {/* Section nav */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-4">
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setSection(key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${section === key ? 'gradient-tide text-white' : 'glass-card text-foam/50'}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        <div className="px-4 space-y-4">
          {loading && <div className="text-center py-8"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>}

          {/* REPORTS */}
          {section === 'reports' && !loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: t('admin.metric_users'),       value: metrics.totalUsers, icon: '👥' },
                  { label: t('admin.metric_catches'),        value: metrics.totalCatches, icon: '🎣' },
                  { label: t('admin.metric_moderations'), value: metrics.totalMods, icon: '🛡' },
                  { label: t('admin.metric_revenue'),      value: '–', icon: '💰' },
                ].map(m => (
                  <div key={m.label} className="glass-card rounded-2xl p-4 text-center">
                    <p className="text-2xl mb-1">{m.icon}</p>
                    <p className="font-display font-extrabold text-2xl text-gradient-tide">{m.value}</p>
                    <p className="text-foam/40 text-xs">{m.label}</p>
                  </div>
                ))}
              </div>
              <div className="glass-card rounded-2xl p-4">
                <p className="text-foam/50 text-xs mb-2">{t('admin.system_info')}</p>
                <p className="text-foam/70 text-sm">StrikeAhead v2.0 · NOMDAD LLC · {new Date().toLocaleDateString(i18n.language || 'de-DE')}</p>
              </div>
            </div>
          )}

          {/* USERS */}
          {section === 'users' && !loading && (
            <div className="space-y-3">
              <div className="glass-card rounded-2xl flex items-center gap-3 px-4 py-3">
                <Search className="w-4 h-4 text-tide-400 flex-shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('admin.search_users')} className="bg-transparent flex-1 text-foam placeholder-foam/30 text-sm outline-none" />
              </div>
              {filteredUsers.map(u => (
                <div key={u.id || u.email} className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl gradient-tide flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                    {u.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foam font-semibold text-sm truncate">{u.full_name || u.email}</p>
                    <p className="text-foam/40 text-xs truncate">{u.email} · {u.role || 'user'} · {u.premium_plan || 'free'}</p>
                  </div>
                  <button className="w-7 h-7 rounded-lg bg-abyss-700 flex items-center justify-center">
                    <Edit3 className="w-3.5 h-3.5 text-tide-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* CATCHES */}
          {section === 'catches' && !loading && (
            <div className="space-y-2">
              {catches.map(c => (
                <div key={c.id} className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-foam font-semibold text-sm">{c.species}</p>
                    <p className="text-foam/40 text-xs">{c.created_by} · {c.caught_date}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${c.verification_level === 'fully_verified' ? 'bg-tide-500/20 text-tide-300' : 'bg-abyss-700 text-foam/40'}`}>
                    {c.verification_level || 'unverified'}
                  </span>
                  <button className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* MODERATION */}
          {section === 'moderation' && !loading && (
            <div className="space-y-2">
              {mods.length === 0 && <p className="text-foam/40 text-center py-8 text-sm">{t('admin.no_moderation')}</p>}
              {mods.map(mod => (
                <div key={mod.id} className="glass-card rounded-xl px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-foam font-semibold text-sm">{mod.user_email}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${mod.warning_level >= 3 ? 'bg-red-500/20 text-red-400' : mod.warning_level >= 2 ? 'bg-sun-500/20 text-sun-400' : 'bg-abyss-700 text-foam/40'}`}>
                        W{mod.warning_level || 0}
                      </span>
                      <button onClick={() => escalateMod(mod)} className="px-2 py-1 rounded-lg bg-tide-500/10 text-tide-400 text-xs font-semibold">
                        {t('admin.escalate')}
                      </button>
                    </div>
                  </div>
                  {(mod.violation_reasons || []).map((r, i) => (
                    <p key={r} className="text-foam/40 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{r}</p>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* ENTITIES */}
          {section === 'entities' && !loading && (
            <div className="space-y-2">
              {['Species', 'FishEncyclopedia', 'BaitCatalog', 'Regulation', 'SeasonalPattern'].map(entity => (
                <div key={entity} className="glass-card rounded-xl px-4 py-3.5 flex items-center justify-between">
                  <p className="text-foam font-semibold text-sm">{entity}</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-tide-500/10 text-tide-400 text-xs font-semibold">{t('admin.manage')}</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* COMPETITIONS */}
          {section === 'competitions' && !loading && (
            <div className="space-y-3">
              <button className="w-full py-3 rounded-xl gradient-tide text-white text-sm font-bold">+ {t('admin.create_competition')}</button>
              <button className="w-full py-3 rounded-xl glass-card border border-tide-400/30 text-tide-300 text-sm font-bold">+ {t('admin.create_tournament')}</button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}