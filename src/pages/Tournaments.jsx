import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Anchor, Clock, Trophy, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import PageTransition from '../components/ui/PageTransition';
import PaywallModal from '../components/shared/PaywallModal';
import { useEntitlement } from '@/hooks/useEntitlement';

const TABS = [
  { key: 'upcoming', label: 'tournaments_open' },
  { key: 'active', label: 'tournaments_running' },
  { key: 'completed', label: 'tournaments_ended' },
];

const TYPE_KEYS = ['solo_challenge','crew_battle','regional_cup','species_hunt','big_fish','most_catches','heaviest_total'];
const SCORING_KEYS = ['biggest_single','total_weight','total_count','total_length','species_variety'];

const localeTag = (code) => {
  const map = { de: 'de-DE', en: 'en-US', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', hr: 'hr-HR', pt: 'pt-PT', nl: 'nl-NL', tr: 'tr-TR', el: 'el-GR', sq: 'sq-AL' };
  return map[code] || 'de-DE';
};

export default function Tournaments() {
  const { t, i18n } = useTranslation();
  const { canAccess, requiredTier } = useEntitlement();
  const hasAccess = canAccess('tournaments');
  const TYPE_LABELS = React.useMemo(() => {
    const defaults = { solo_challenge:'Solo', crew_battle:'Crew', regional_cup:'Regional', species_hunt:'Artenjagd', big_fish:'Big Fish', most_catches:'Most Catches', heaviest_total:'Heaviest' };
    return Object.fromEntries(TYPE_KEYS.map(k => [k, t(`tournaments.type_${k}`, { defaultValue: defaults[k] })]));
  }, [t]);
  const SCORING_LABELS = React.useMemo(() => {
    const defaults = { biggest_single:'Größter Einzelfang', total_weight:'Gesamtgewicht', total_count:'Fanganzahl', total_length:'Gesamtlänge', species_variety:'Artenvielfalt' };
    return Object.fromEntries(SCORING_KEYS.map(k => [k, t(`tournaments.scoring_${k}`, { defaultValue: defaults[k] })]));
  }, [t]);
  const [tab, setTab] = useState('upcoming');
  const [tournaments, setTournaments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([base44.auth.me(), base44.entities.Tournament.list('-start_date', 100)])
      .then(([u, ts]) => { setUser(u); setTournaments(ts); })
      .finally(() => setLoading(false));
  }, []);

  const handleRegister = async (tournament) => {
    await base44.entities.TournamentEntry.create({
      tournament_id: tournament.id,
      user_email: user?.email,
      status: 'registered',
    });
    await base44.entities.Tournament.update(tournament.id, {
      current_participants: (tournament.current_participants || 0) + 1,
    });
    setTournaments(prev => prev.map(t => t.id === tournament.id
      ? { ...t, current_participants: (t.current_participants || 0) + 1 } : t));
  };

  const filtered = tournaments.filter(t => t.status === tab);

  return (
    <PageTransition>
      {!hasAccess && (
        <PaywallModal open={true} onClose={() => window.history.back()} featureKey="tournaments" requiredTier={requiredTier('tournaments')} />
      )}
      {hasAccess && (
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div>
          <p className="text-foam/50 text-sm">{t('community.tournaments')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('community.tournaments')}</h1>
        </div>

        <div className="glass-card rounded-2xl p-1 flex gap-1">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${tab === key ? 'gradient-tide text-white' : 'text-foam/50'}`}>
              {t(`community.${label}`)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16"><p className="text-5xl mb-4">🏆</p><p className="text-foam/50">{t('community.tournaments_empty')}</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((tour, i) => (
              <motion.div key={tour.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-lg bg-tide-500/20 text-tide-300 text-xs">{TYPE_LABELS[tour.type] || tour.type}</span>
                      {tour.is_official && <span className="px-2 py-0.5 rounded-lg bg-sun-500/20 text-sun-300 text-xs">✓ {t('tournaments.official', { defaultValue: 'Offiziell' })}</span>}
                    </div>
                    <h3 className="text-foam font-bold">{tour.title}</h3>
                    <p className="text-foam/40 text-xs mt-0.5">{SCORING_LABELS[tour.scoring_method]}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="glass-card rounded-xl p-2.5">
                    <p className="text-foam/40 text-[10px] mb-0.5">{t('community.tournaments_fee')}</p>
                    <p className="text-sun-400 font-display font-bold text-sm">{tour.entry_fee_hookpoints || 0} HP</p>
                  </div>
                  <div className="glass-card rounded-xl p-2.5">
                    <p className="text-foam/40 text-[10px] mb-0.5">{t('community.tournaments_prize')}</p>
                    <p className="text-sun-400 font-display font-bold text-sm">{(tour.prize_pool_hookpoints || 0).toLocaleString(localeTag(i18n.language))} HP</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <span className="text-foam/40 text-xs flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {tour.current_participants || 0}/{tour.max_participants || '∞'}
                    </span>
                    {tour.registration_deadline && (
                      <span className="text-foam/40 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(tour.registration_deadline).toLocaleDateString(localeTag(i18n.language))}
                      </span>
                    )}
                  </div>
                  {tour.status === 'upcoming' && (
                    <button onClick={() => handleRegister(tour)}
                      className="px-3 py-1.5 rounded-xl gradient-tide text-white text-xs font-bold">
                      {t('community.tournaments_register')}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      )}
    </PageTransition>
  );
}