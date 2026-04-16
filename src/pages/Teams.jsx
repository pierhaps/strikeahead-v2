import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Share2, Trophy, Fish, Copy, Check, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import PageTransition from '../components/ui/PageTransition';

const tideEase = [0.2, 0.8, 0.2, 1];


const localeTag = (code) => {
  const map = { de: 'de-DE', en: 'en-US', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', hr: 'hr-HR', pt: 'pt-PT', nl: 'nl-NL', tr: 'tr-TR', el: 'el-GR', sq: 'sq-AL' };
  return map[code] || 'de-DE';
};

export default function Teams() {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState('all');
  const [teams, setTeams] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Team.list('-total_hook_points', 50),
    ]).then(([u, ts]) => {
      setUser(u);
      setTeams(ts);
      const mine = ts.find(t => t.captain_email === u?.email || (t.members || []).includes(u?.email));
      setMyTeam(mine || null);
    }).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newTeamName.trim()) return;
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const team = await base44.entities.Team.create({
      name: newTeamName,
      description: newTeamDesc,
      captain_email: user?.email,
      members: [user?.email],
      invite_code: code,
      is_public: true,
    });
    setTeams(prev => [team, ...prev]);
    setMyTeam(team);
    setShowCreate(false);
    setNewTeamName('');
    setNewTeamDesc('');
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(myTeam?.invite_code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = teams.filter(t => t.is_public !== false && t.name?.toLowerCase().includes(search.toLowerCase()));

  const TeamCard = ({ team }) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-2xl bg-abyss-700 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
        {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-cover" alt="" /> : '⚓'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-foam font-bold truncate">{team.name}</p>
        {team.region && <p className="text-foam/40 text-xs">{team.region}</p>}
        <div className="flex gap-3 mt-1">
          <span className="text-tide-400 text-xs flex items-center gap-1"><Users className="w-3 h-3" />{(team.members || []).length}</span>
          <span className="text-foam/40 text-xs flex items-center gap-1"><Fish className="w-3 h-3" />{team.total_catches || 0}</span>
          <span className="text-sun-400 text-xs flex items-center gap-1"><Trophy className="w-3 h-3" />{(team.total_hook_points || 0).toLocaleString(localeTag(i18n.language))}</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foam/50 text-sm">{t('community.teams')}</p>
            <h1 className="font-display text-2xl font-extrabold text-foam">{t('community.teams')}</h1>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCreate(true)}
            className="w-11 h-11 rounded-2xl gradient-tide flex items-center justify-center glow-tide">
            <Plus className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="glass-card rounded-2xl p-1 flex gap-1">
          {['mine', 'all'].map(k => (
            <button key={k} onClick={() => setTab(k)}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${tab === k ? 'gradient-tide text-white' : 'text-foam/50'}`}>
              {t(`community.teams_${k === 'mine' ? 'mine' : 'all'}`)}
            </button>
          ))}
        </div>

        {tab === 'mine' && (
          myTeam ? (
            <div className="space-y-3">
              <TeamCard team={myTeam} />
              <div className="glass-card rounded-2xl p-4">
                <p className="text-foam/50 text-xs mb-2">{t('community.teams_invite')}</p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-tide-400 font-display font-bold text-lg tracking-widest">{myTeam.invite_code}</code>
                  <button onClick={copyInvite} className="w-9 h-9 rounded-xl bg-tide-500/10 border border-tide-400/30 flex items-center justify-center">
                    {copied ? <Check className="w-4 h-4 text-tide-400" /> : <Copy className="w-4 h-4 text-tide-400" />}
                  </button>
                  <button className="w-9 h-9 rounded-xl bg-tide-500/10 border border-tide-400/30 flex items-center justify-center">
                    <Share2 className="w-4 h-4 text-tide-400" />
                  </button>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <p className="text-foam/50 text-xs mb-2">{t('community.teams_members')}</p>
                <div className="space-y-2">
                  {(myTeam.members || []).map((email, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl gradient-tide flex items-center justify-center text-xs text-white font-bold">{email[0]?.toUpperCase()}</div>
                      <span className="text-foam text-sm">{email}</span>
                      {email === myTeam.captain_email && <span className="text-sun-400 text-xs">👑</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">⚓</p>
              <p className="text-foam/50">{t('community.teams_empty')}</p>
              <button onClick={() => setShowCreate(true)} className="mt-4 px-5 py-2.5 rounded-2xl gradient-tide text-white font-semibold text-sm">{t('community.teams_found')}</button>
            </div>
          )
        )}

        {tab === 'all' && (
          <div className="space-y-3">
            <div className="glass-card rounded-2xl flex items-center gap-3 px-4 py-3">
              <Search className="w-4 h-4 text-tide-400 flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('teams.search_placeholder', { defaultValue: 'Team suchen...' })} className="bg-transparent flex-1 text-foam placeholder-foam/30 text-sm outline-none" />
            </div>
            {loading ? (
              <div className="text-center py-12"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16"><p className="text-foam/50">{t('community.teams_empty')}</p></div>
            ) : (
              filtered.map(team => <TeamCard key={team.id} team={team} />)
            )}
          </div>
        )}

        {/* Create modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
              onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
              <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                className="w-full max-w-lg glass-strong rounded-t-3xl p-6 space-y-4">
                <h2 className="font-display font-bold text-foam text-lg">{t('community.teams_found')}</h2>
                <input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="Team-Name *"
                  className="w-full glass-card rounded-xl px-4 py-3 text-foam placeholder-foam/30 text-sm outline-none" />
                <input value={newTeamDesc} onChange={e => setNewTeamDesc(e.target.value)} placeholder="Beschreibung (optional)"
                  className="w-full glass-card rounded-xl px-4 py-3 text-foam placeholder-foam/30 text-sm outline-none" />
                <button onClick={handleCreate} className="w-full py-4 rounded-2xl gradient-tide text-white font-display font-bold">{t('community.teams_found')}</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}