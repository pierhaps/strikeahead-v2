import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Euro, Star } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';

const tideEase = [0.2, 0.8, 0.2, 1];

const TABS = [
  { key: 'artificial', label: 'Künstlich' },
  { key: 'natural', label: 'Natürlich' },
  { key: 'live', label: 'Lebend' },
];

function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3 h-3 ${i < Math.round(rating || 0) ? 'text-sun-400 fill-sun-400' : 'text-foam/20'}`} />
      ))}
      {count != null && <span className="text-foam/30 text-[10px] ml-0.5">({count})</span>}
    </div>
  );
}

function DetailSheet({ bait, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(2,21,33,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="glass-strong rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-foam/20 rounded-full mx-auto mb-4" />
        <div className="flex gap-4 mb-4">
          {bait.image_url && (
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
              <img src={bait.image_url} alt={bait.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="font-display font-bold text-foam text-lg">{bait.name_de || bait.name}</h2>
            {bait.brand && <p className="text-foam/50 text-sm">{bait.brand} {bait.model ? `· ${bait.model}` : ''}</p>}
            <StarRating rating={bait.rating} count={bait.rating_count} />
            {bait.price_eur && (
              <div className="flex items-center gap-1 mt-1">
                <Euro className="w-3.5 h-3.5 text-sun-400" />
                <span className="font-bold text-sun-400">{bait.price_eur} €</span>
              </div>
            )}
          </div>
        </div>

        {bait.description_de && <p className="text-foam/60 text-sm mb-4 leading-relaxed">{bait.description_de}</p>}

        {bait.rigging_method && (
          <div className="glass-card rounded-xl p-3 mb-3">
            <p className="text-foam/40 text-xs mb-1">Rig-Methode</p>
            <p className="text-foam font-semibold text-sm">{bait.rigging_method}</p>
          </div>
        )}

        {bait.recommended_techniques?.length > 0 && (
          <div className="glass-card rounded-xl p-3 mb-3">
            <p className="text-foam/40 text-xs mb-2">Techniken</p>
            <div className="flex flex-wrap gap-1.5">
              {bait.recommended_techniques.map(t => (
                <span key={t} className="px-2.5 py-1 bg-tide-500/15 text-tide-300 rounded-xl text-xs">{t}</span>
              ))}
            </div>
          </div>
        )}

        {bait.recommended_species?.length > 0 && (
          <div className="glass-card rounded-xl p-3 mb-3">
            <p className="text-foam/40 text-xs mb-2">Zielfische</p>
            <div className="flex flex-wrap gap-1.5">
              {bait.recommended_species.map(s => (
                <span key={s} className="px-2.5 py-1 bg-abyss-700 text-foam/60 rounded-xl text-xs">{s}</span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mb-4">
          {bait.size && <div className="glass-card rounded-xl p-2 text-center"><p className="text-foam/30 text-[10px]">Größe</p><p className="text-foam font-bold text-xs">{bait.size}</p></div>}
          {bait.weight_g && <div className="glass-card rounded-xl p-2 text-center"><p className="text-foam/30 text-[10px]">Gewicht</p><p className="text-foam font-bold text-xs">{bait.weight_g}g</p></div>}
          {bait.color && <div className="glass-card rounded-xl p-2 text-center"><p className="text-foam/30 text-[10px]">Farbe</p><p className="text-foam font-bold text-xs truncate">{bait.color}</p></div>}
        </div>

        <button onClick={onClose} className="w-full py-3.5 rounded-2xl glass-card text-foam/70 font-semibold">Schließen</button>
      </motion.div>
    </motion.div>
  );
}

export default function BaitCatalogPage() {
  const [baits, setBaits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('artificial');
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.BaitCatalog.list('name', 500).then(d => { setBaits(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const byCategory = baits.filter(b => b.category === tab);
  const brands = [...new Set(byCategory.map(b => b.brand).filter(Boolean))].sort();

  const filtered = byCategory.filter(b => {
    if (search && !(b.name || '').toLowerCase().includes(search.toLowerCase()) && !(b.name_de || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (filterBrand !== 'all' && b.brand !== filterBrand) return false;
    return true;
  });

  if (loading) return <PageTransition><div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" /></div></PageTransition>;

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div>
          <p className="text-foam/50 text-sm">Köder & Zubehör</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">Köder-Katalog</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {TABS.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setFilterBrand('all'); }}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${tab === t.key ? 'gradient-tide text-white glow-tide' : 'glass-card text-foam/60'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex-1 glass-card rounded-2xl flex items-center gap-3 px-3 py-2.5">
            <Search className="w-4 h-4 text-tide-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Köder suchen..."
              className="bg-transparent flex-1 text-foam placeholder-foam/30 text-xs outline-none" />
          </div>
          {brands.length > 0 && (
            <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-abyss-700 text-foam/70 border border-tide-300/15 flex-shrink-0">
              <option value="all">Alle Marken</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center mt-8">
            <div className="text-5xl mb-4">🪝</div>
            <p className="font-display font-bold text-foam text-lg">Keine Köder</p>
            <p className="text-foam/40 text-sm mt-2">Katalog wird bald befüllt</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((b, i) => (
              <motion.button key={b.id} onClick={() => setSelected(b)}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileTap={{ scale: 0.97 }}
                className="glass-card rounded-2xl overflow-hidden text-left">
                <div className="h-28 bg-abyss-800 relative">
                  {b.image_url
                    ? <img src={b.image_url} alt={b.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">🪝</div>
                  }
                </div>
                <div className="p-2.5 space-y-1">
                  <p className="font-bold text-foam text-xs leading-tight line-clamp-2">{b.name_de || b.name}</p>
                  {b.brand && <p className="text-foam/40 text-[10px]">{b.brand}</p>}
                  <StarRating rating={b.rating} count={b.rating_count} />
                  {b.price_eur && (
                    <p className="font-display font-bold text-sun-400 text-sm">{b.price_eur} €</p>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <DetailSheet bait={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </PageTransition>
  );
}