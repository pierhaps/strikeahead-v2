import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Search, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageTransition from '../components/ui/PageTransition';

function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-sun-400 fill-sun-400' : 'text-foam/20'}`} />
      ))}
      {count != null && <span className="text-foam/40 text-xs">({count})</span>}
    </div>
  );
}

export default function Coaches() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.User.list('-total_coaching_sessions', 100)
      .then(users => setCoaches(users.filter(u => u.is_coach)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = coaches.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    (c.coaching_specialties || []).some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div>
          <p className="text-foam/50 text-sm">{t('community.coaches')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('community.coaches')}</h1>
        </div>

        <div className="glass-card rounded-2xl flex items-center gap-3 px-4 py-3">
          <Search className="w-4 h-4 text-tide-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('community.coaches_filter_specialty')}
            className="bg-transparent flex-1 text-foam placeholder-foam/30 text-sm outline-none" />
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16"><p className="text-5xl mb-4">🎣</p><p className="text-foam/50">{t('community.coaches_empty')}</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((coach, i) => (
              <motion.div key={coach.id || coach.email} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl gradient-tide flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                    {coach.profile_photo ? <img src={coach.profile_photo} className="w-full h-full object-cover" alt="" /> : '🎣'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foam font-bold">{coach.full_name}</h3>
                    <StarRating rating={coach.coaching_rating || 0} count={coach.coaching_reviews_count} />
                    <div className="flex gap-3 mt-1.5">
                      <span className="text-sun-400 text-xs font-bold">{coach.coach_hourly_rate || '–'} €/Std</span>
                      <span className="text-foam/40 text-xs">{coach.total_coaching_sessions || 0} Sessions</span>
                    </div>
                  </div>
                </div>

                {(coach.coaching_specialties || []).length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {coach.coaching_specialties.map(sp => (
                      <span key={sp} className="px-2 py-0.5 rounded-lg bg-tide-500/10 text-tide-300 text-xs">{sp}</span>
                    ))}
                  </div>
                )}

                <button onClick={() => navigate('/bookcoach', { state: { coach } })}
                  className="w-full py-2.5 rounded-xl gradient-tide text-white text-sm font-bold">
                  {t('community.coaches_book')}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}