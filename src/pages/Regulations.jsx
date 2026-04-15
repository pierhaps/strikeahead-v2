import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Fish, Ruler, Calendar, RefreshCw } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';

const tideEase = [0.2, 0.8, 0.2, 1];

export default function Regulations() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterSpecies, setFilterSpecies] = useState('all');

  useEffect(() => {
    base44.entities.Regulation.list('region', 500).then(d => { setRegs(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const regions = [...new Set(regs.map(r => r.region).filter(Boolean))].sort();
  const species = [...new Set(regs.map(r => r.species).filter(Boolean))].sort();

  const filtered = regs.filter(r => {
    if (filterRegion !== 'all' && r.region !== filterRegion) return false;
    if (filterSpecies !== 'all' && r.species !== filterSpecies) return false;
    return true;
  });

  if (loading) return <PageTransition><div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" /></div></PageTransition>;

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div>
          <p className="text-foam/50 text-sm">Gesetzliche Vorschriften</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">Fangbestimmungen</h1>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-abyss-700 text-foam/70 border border-tide-300/15 flex-shrink-0">
            <option value="all">Alle Bundesländer</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filterSpecies} onChange={e => setFilterSpecies(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-abyss-700 text-foam/70 border border-tide-300/15 flex-shrink-0">
            <option value="all">Alle Arten</option>
            {species.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="px-3 py-2 rounded-xl text-xs font-semibold glass-card text-tide-400 flex-shrink-0">{filtered.length} Regeln</span>
        </div>

        {filtered.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center mt-8">
            <div className="text-5xl mb-4">📋</div>
            <p className="font-display font-bold text-foam text-lg">Keine Bestimmungen gefunden</p>
            <p className="text-foam/40 text-sm mt-2">Filter anpassen oder Daten werden bald geladen</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, ease: tideEase }}
                className="glass-card rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-display font-bold text-foam">{r.species}</p>
                    {r.species_latin && <p className="text-foam/40 italic text-xs">{r.species_latin}</p>}
                    <p className="text-tide-400 text-xs mt-0.5">{r.region}{r.country && r.country !== 'Germany' ? ` · ${r.country}` : ''}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {r.catch_release_allowed !== false && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-tide-500/15 text-tide-300 border border-tide-400/20">C&R ✓</span>
                    )}
                    {r.entnahmepflicht && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-coral-500/15 text-coral-500 border border-coral-500/25">Entnahmepflicht</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {r.mindestmass_cm && (
                    <div className="glass-card rounded-xl p-2 text-center">
                      <Ruler className="w-3.5 h-3.5 text-tide-400 mx-auto mb-1" />
                      <p className="font-bold text-foam text-sm">{r.mindestmass_cm} cm</p>
                      <p className="text-foam/30 text-[10px]">Min-Maß</p>
                    </div>
                  )}
                  {r.maxmass_cm && (
                    <div className="glass-card rounded-xl p-2 text-center">
                      <Ruler className="w-3.5 h-3.5 text-sun-400 mx-auto mb-1" />
                      <p className="font-bold text-foam text-sm">{r.maxmass_cm} cm</p>
                      <p className="text-foam/30 text-[10px]">Max-Maß</p>
                    </div>
                  )}
                  {(r.schonzeit_start || r.schonzeit_end) && (
                    <div className="glass-card rounded-xl p-2 text-center">
                      <Calendar className="w-3.5 h-3.5 text-foam/50 mx-auto mb-1" />
                      <p className="font-bold text-foam text-[11px]">{r.schonzeit_start}–{r.schonzeit_end}</p>
                      <p className="text-foam/30 text-[10px]">Schonzeit</p>
                    </div>
                  )}
                </div>

                {r.special_notes && (
                  <p className="text-foam/50 text-xs leading-relaxed mb-2">{r.special_notes}</p>
                )}

                {r.source_url && (
                  <a href={r.source_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-tide-400 text-xs hover:text-tide-300">
                    <ExternalLink className="w-3 h-3" /> Amtliche Quelle
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}
        <div className="h-4" />
      </div>
    </PageTransition>
  );
}