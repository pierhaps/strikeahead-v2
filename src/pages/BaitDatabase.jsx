import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';

const tideEase = [0.2, 0.8, 0.2, 1];

const CATEGORY_ICONS = { artificial: '🎣', natural: '🪱', live: '🐟' };
const CATEGORY_DE = { artificial: 'Kunstköder', natural: 'Naturköder', live: 'Lebendköder' };

function EffectivenessBar({ score }) {
  const pct = (score / 5) * 100;
  return (
    <div className="h-1.5 bg-abyss-700 rounded-full overflow-hidden">
      <motion.div className="h-full rounded-full"
        style={{ background: pct > 80 ? '#F5C34B' : '#1FA7B8' }}
        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7 }} />
    </div>
  );
}

export default function BaitDatabase() {
  const [recommendations, setRecommendations] = useState([]);
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.BaitRecommendation.list('-effectiveness_score', 500),
      base44.entities.FishEncyclopedia.list('name_de', 200),
    ]).then(([recs, fish]) => {
      setRecommendations(recs || []);
      const names = [...new Set((recs || []).map(r => r.fish_species).filter(Boolean))].sort();
      setSpecies(names);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredSpecies = species.filter(s => !query || s.toLowerCase().includes(query.toLowerCase()));
  const recs = recommendations.filter(r => r.fish_species === selectedSpecies).sort((a, b) => (b.effectiveness_score || 0) - (a.effectiveness_score || 0));

  if (loading) return <PageTransition><div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" /></div></PageTransition>;

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div>
          <p className="text-foam/50 text-sm">Köder-Datenbank</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">Welcher Köder?</h1>
        </div>

        <div className="glass-card rounded-2xl flex items-center gap-3 px-4 py-3">
          <Search className="w-4 h-4 text-tide-400 flex-shrink-0" />
          <input value={query} onChange={e => { setQuery(e.target.value); setSelectedSpecies(null); }}
            placeholder="Welche Fischart angeln?"
            className="bg-transparent flex-1 text-foam placeholder-foam/30 text-sm outline-none" />
        </div>

        <AnimatePresence mode="wait">
          {!selectedSpecies ? (
            <motion.div key="species-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filteredSpecies.length === 0 ? (
                <div className="glass-card rounded-3xl p-10 text-center mt-4">
                  <div className="text-5xl mb-4">🐟</div>
                  <p className="font-display font-bold text-foam text-lg">Keine Arten gefunden</p>
                  <p className="text-foam/40 text-sm mt-2">Empfehlungsdaten werden bald geladen</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-foam/40 text-xs uppercase tracking-widest">{filteredSpecies.length} Arten verfügbar</p>
                  {filteredSpecies.map((s, i) => (
                    <motion.button key={s} onClick={() => setSelectedSpecies(s)}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full glass-card rounded-2xl p-4 text-left flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl gradient-tide flex items-center justify-center text-xl flex-shrink-0">🐟</div>
                      <div className="flex-1">
                        <p className="font-semibold text-foam text-sm">{s}</p>
                        <p className="text-foam/40 text-xs">{recommendations.filter(r => r.fish_species === s).length} Köder-Empfehlungen</p>
                      </div>
                      <span className="text-foam/30 text-lg">›</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="recs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => setSelectedSpecies(null)} className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-foam/60 text-lg">←</button>
                <div>
                  <p className="text-foam/40 text-xs">Empfehlungen für</p>
                  <h2 className="font-display font-bold text-foam text-lg">{selectedSpecies}</h2>
                </div>
              </div>

              {recs.length === 0 ? (
                <div className="glass-card rounded-3xl p-8 text-center">
                  <div className="text-4xl mb-3">🪝</div>
                  <p className="font-bold text-foam">Noch keine Empfehlungen</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recs.map((r, i) => (
                    <motion.div key={r.id || i}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card rounded-2xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{CATEGORY_ICONS[r.bait_category] || '🪝'}</span>
                          <div>
                            <p className="font-display font-bold text-foam text-sm">{r.bait_name}</p>
                            {r.bait_brand && <p className="text-foam/40 text-xs">{r.bait_brand}</p>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-abyss-700 text-foam/60">
                            {CATEGORY_DE[r.bait_category] || r.bait_category}
                          </span>
                          {r.success_rate_pct != null && (
                            <span className="text-sun-400 text-xs font-bold">{r.success_rate_pct}% Erfolg</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-foam/40">Effektivität</span>
                        <span className="font-bold text-tide-400">{r.effectiveness_score}/5</span>
                      </div>
                      <EffectivenessBar score={r.effectiveness_score} />

                      {r.conditions_best && (
                        <p className="text-foam/50 text-xs mt-2">💡 {r.conditions_best}</p>
                      )}
                      {r.description_de && (
                        <p className="text-foam/40 text-xs mt-1 leading-relaxed">{r.description_de}</p>
                      )}
                      {r.technique?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {r.technique.map(t => <span key={t} className="px-2 py-0.5 bg-tide-500/12 text-tide-300 rounded-lg text-[10px]">{t}</span>)}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="h-4" />
      </div>
    </PageTransition>
  );
}