import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Clock, Fish, Anchor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import PageTransition from '../components/ui/PageTransition';

const TABS = [
  { key: 'active', label: 'competitions_active', status: 'active' },
  { key: 'upcoming', label: 'competitions_upcoming', status: 'upcoming' },
  { key: 'ended', label: 'competitions_ended', status: 'completed' },
];

const TYPE_COLORS = {
  weekly_challenge: 'bg-tide-500/20 text-tide-300',
  monthly_tournament: 'bg-sun-500/20 text-sun-300',
  sponsored_event: 'bg-coral-500/20 text-coral-500',
  crew_battle: 'bg-abyss-600/60 text-foam',
};

function Countdown({ endDate }) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate) - Date.now();
      if (diff <= 0) return setLabel('Beendet');
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      setLabel(d > 0 ? `${d}T ${h}H` : `${h}H`);
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [endDate]);
  return <span className="text-sun-400 font-display font-bold text-sm">{label}</span>;
}


const localeTag = (code) => {
  const map = { de: 'de-DE', en: 'en-US', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', hr: 'hr-HR', pt: 'pt-PT', nl: 'nl-NL', tr: 'tr-TR', el: 'el-GR', sq: 'sq-AL' };
  return map[code] || 'de-DE';
};

export default function Competitions() {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState('active');
  const [comps, setComps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Competition.list('-start_date', 100).then(setComps).finally(() => setLoading(false));
  }, []);

  const activeStatus = TABS.find(t => t.key === tab)?.status;
  const filtered = comps.filter(c => c.status === activeStatus);

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div>
          <p className="text-foam/50 text-sm">{t('community.competitions')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('community.competitions')}</h1>
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
          <div className="text-center py-16"><p className="text-5xl mb-4">🏆</p><p className="text-foam/50">{t('community.competitions_empty')}</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((comp, i) => (
              <motion.div key={comp.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {comp.sponsor_logo && (
                      <img src={comp.sponsor_logo} alt="" className="h-6 mb-1.5 object-contain" />
                    )}
                    <h3 className="text-foam font-bold leading-tight">{comp.name}</h3>
                    {comp.region && <p className="text-foam/40 text-xs mt-0.5">{comp.region}</p>}
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${TYPE_COLORS[comp.type] || 'bg-abyss-700 text-foam/60'}`}>
                    {comp.type?.replace('_', ' ')}
                  </span>
                </div>

                {(comp.target_species || []).length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {comp.target_species.map(sp => (
                      <span key={sp} className="px-2 py-0.5 rounded-lg bg-tide-500/10 text-tide-300 text-xs flex items-center gap-1"><Fish className="w-3 h-3" />{sp}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1 text-foam/50 text-xs"><Users className="w-3 h-3" />{comp.participants_count || 0}</div>
                    <div className="flex items-center gap-1 text-sun-400 text-xs"><Anchor className="w-3 h-3" />{(comp.prize_hook_points || 0).toLocaleString(localeTag(i18n.language))} HP</div>
                    {comp.end_date && <div className="flex items-center gap-1 text-xs"><Clock className="w-3 h-3 text-foam/30" /><Countdown endDate={comp.end_date} /></div>}
                  </div>
                  {comp.status === 'active' && (
                    <button className="px-3 py-1.5 rounded-xl gradient-tide text-white text-xs font-bold">{t('community.competitions_join')}</button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}