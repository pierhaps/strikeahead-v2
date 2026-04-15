import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Fish } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const tideEase = [0.2, 0.8, 0.2, 1];

export default function Statistics() {
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Catch.list('-weight_kg', 500).then(data => {
      setCatches(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const best = catches.find(c => c.weight_kg) || catches[0];

  // Per-species records
  const speciesMap = {};
  catches.forEach(c => {
    const s = c.species || 'Unbekannt';
    if (!speciesMap[s]) speciesMap[s] = { species: s, maxLength: 0, maxWeight: 0, total: 0, released: 0 };
    speciesMap[s].total += 1;
    if (c.released) speciesMap[s].released += 1;
    if ((c.length_cm || 0) > speciesMap[s].maxLength) speciesMap[s].maxLength = c.length_cm || 0;
    if ((c.weight_kg || 0) > speciesMap[s].maxWeight) speciesMap[s].maxWeight = c.weight_kg || 0;
  });
  const speciesRecords = Object.values(speciesMap).sort((a, b) => b.total - a.total);

  // Timeline: last 10 heavy catches
  const timeline = [...catches].filter(c => c.weight_kg).sort((a, b) => b.weight_kg - a.weight_kg).slice(0, 10);

  if (loading) return (
    <PageTransition><div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" />
    </div></PageTransition>
  );

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-6">
        <div>
          <p className="text-foam/50 text-sm">Deine Rekorde</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">Statistiken</h1>
        </div>

        {/* Hero best catch */}
        {best ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl overflow-hidden"
            style={{ border: '1px solid rgba(245,195,75,0.25)', boxShadow: '0 0 30px rgba(245,195,75,0.1)' }}>
            {best.photo_urls?.[0] && (
              <div className="h-44 relative">
                <img src={best.photo_urls[0]} alt={best.species} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-abyss-950 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(245,195,75,0.9)', color: '#021521' }}>⭐ Bester Fang</div>
              </div>
            )}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-display font-bold text-foam text-lg">{best.species || 'Unbekannt'}</p>
                <p className="text-foam/50 text-sm">{best.caught_date || best.created_date?.split('T')[0]}</p>
              </div>
              <div className="text-right">
                {best.weight_kg && <p className="font-display font-extrabold text-sun-400 text-2xl">{best.weight_kg} kg</p>}
                {best.length_cm && <p className="text-foam/50 text-sm">{best.length_cm} cm</p>}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="text-4xl mb-3">🎣</div>
            <p className="text-foam font-bold">Noch kein Fang</p>
            <p className="text-foam/40 text-sm mt-1">Logge deinen ersten Fang!</p>
          </div>
        )}

        {/* Species records table */}
        {speciesRecords.length > 0 && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-tide-300/10">
              <p className="font-display font-bold text-foam text-sm">Artrekorde</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-tide-300/10">
                    {['Art','Länge','Gewicht','Gesamt','C&R'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-foam/40 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {speciesRecords.map((r, i) => (
                    <motion.tr key={r.species}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-tide-300/5 last:border-0">
                      <td className="px-3 py-3 text-foam font-semibold whitespace-nowrap">{r.species}</td>
                      <td className="px-3 py-3 text-tide-400 font-bold">{r.maxLength ? `${r.maxLength} cm` : '—'}</td>
                      <td className="px-3 py-3 text-sun-400 font-bold">{r.maxWeight ? `${r.maxWeight} kg` : '—'}</td>
                      <td className="px-3 py-3 text-foam/70">{r.total}</td>
                      <td className="px-3 py-3 text-foam/50">{r.total ? `${Math.round((r.released / r.total) * 100)}%` : '—'}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PB Timeline */}
        {timeline.length > 0 && (
          <div>
            <p className="text-foam/50 text-xs uppercase tracking-widest mb-3">Bestleistungen Timeline</p>
            <div className="space-y-2">
              {timeline.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-abyss-700">
                    {c.photo_urls?.[0]
                      ? <img src={c.photo_urls[0]} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">🐟</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foam font-semibold text-sm">{c.species}</p>
                    <p className="text-foam/40 text-xs">{c.caught_date || c.created_date?.split('T')[0]}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display font-bold text-sun-400">{c.weight_kg} kg</p>
                    {c.length_cm && <p className="text-foam/40 text-xs">{c.length_cm} cm</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </PageTransition>
  );
}