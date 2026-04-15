import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import PageTransition from '../components/ui/PageTransition';

const LEVEL_COLORS = { bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FDD835' };
const LEVEL_ORDER = ['gold', 'silver', 'bronze'];

export default function GuideDirectory() {
  const { t } = useTranslation();
  const [guides, setGuides] = useState([]);
  const [users, setUsers] = useState({});
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.GuideProfile.list('-verified_catches_count', 100),
      base44.entities.User.list(),
    ]).then(([gs, us]) => {
      setGuides(gs.filter(g => g.is_active));
      const userMap = {};
      us.forEach(u => { userMap[u.email] = u; });
      setUsers(userMap);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = guides.filter(g => filter === 'all' || g.guide_level === filter);

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div>
          <p className="text-foam/50 text-sm">{t('community.guides')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('community.guides')}</h1>
        </div>

        {/* Level filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {['all', ...LEVEL_ORDER].map(level => (
            <button key={level} onClick={() => setFilter(level)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === level ? 'gradient-tide text-white' : 'glass-card text-foam/50'}`}
              style={filter === level && level !== 'all' ? { background: `rgba(${level === 'gold' ? '253,216,53' : level === 'silver' ? '192,192,192' : '205,127,50'},0.2)`, color: LEVEL_COLORS[level] } : {}}>
              {level === 'all' ? 'Alle' : level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16"><p className="text-5xl mb-4">🏅</p><p className="text-foam/50">{t('community.guides_empty')}</p></div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((guide, i) => {
              const u = users[guide.user_email] || {};
              const color = LEVEL_COLORS[guide.guide_level] || '#CD7F32';
              const borderW = guide.badge_tier || (guide.guide_level === 'gold' ? 3 : guide.guide_level === 'silver' ? 2 : 1);
              return (
                <motion.div key={guide.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                  className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
                  style={{ borderWidth: borderW, borderColor: color, boxShadow: `0 0 12px ${color}30` }}>
                  <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center text-2xl"
                    style={{ background: `linear-gradient(135deg, ${color}30, ${color}15)`, border: `2px solid ${color}60` }}>
                    {u.profile_photo ? <img src={u.profile_photo} className="w-full h-full object-cover" alt="" /> : '🏅'}
                  </div>
                  <p className="text-foam font-bold text-sm leading-tight">{u.full_name || guide.user_email}</p>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: `${color}25`, color }}>
                    {guide.guide_level?.toUpperCase()}
                  </span>
                  <div className="grid grid-cols-2 gap-1 w-full mt-1">
                    <div className="glass-card rounded-lg p-1.5 text-center">
                      <p className="text-tide-400 font-bold text-sm">{guide.verified_catches_count || 0}</p>
                      <p className="text-foam/30 text-[9px]">{t('community.guides_catches')}</p>
                    </div>
                    <div className="glass-card rounded-lg p-1.5 text-center">
                      <p className="text-tide-400 font-bold text-sm">{guide.total_guides_given || 0}</p>
                      <p className="text-foam/30 text-[9px]">{t('community.guides_given')}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}