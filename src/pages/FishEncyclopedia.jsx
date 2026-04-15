import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, Thermometer, Anchor, Clock } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';

const tideEase = [0.2, 0.8, 0.2, 1];

const RARITY_CFG = {
  common: { label: 'Häufig', color: '#4DC3D1', bg: 'rgba(77,195,209,0.15)' },
  uncommon: { label: 'Selten', color: '#7FDCE5', bg: 'rgba(127,220,229,0.12)' },
  rare: { label: 'Rar', color: '#F5C34B', bg: 'rgba(245,195,75,0.15)' },
  epic: { label: 'Episch', color: '#FF6B5B', bg: 'rgba(255,107,91,0.15)' },
  legendary: { label: 'Legendär', color: '#FFD872', bg: 'rgba(255,216,114,0.15)' },
};
const MONTH_NAMES = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
const DETAIL_TABS = ['Übersicht', 'Erkennung', 'Technik', 'Ausrüstung', 'Küche'];

function DetailView({ fish, onClose }) {
  const [tab, setTab] = useState(0);
  const rc = RARITY_CFG[fish.rarity] || RARITY_CFG.common;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-abyss-950 overflow-y-auto">
      {/* Hero */}
      <div className="relative h-56 flex-shrink-0">
        {fish.image_url
          ? <img src={fish.image_url} alt={fish.name_de} className="w-full h-full object-cover" />
          : <div className="w-full h-full gradient-tide opacity-40" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-abyss-950 via-transparent to-transparent" />
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full glass-strong flex items-center justify-center">
          <X className="w-4 h-4 text-foam" />
        </button>
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold"
              style={{ background: rc.bg, color: rc.color }}>{rc.label}</span>
          </div>
          <h2 className="font-display font-extrabold text-foam text-2xl">{fish.name_de}</h2>
          <p className="text-foam/50 italic text-sm">{fish.name_latin || fish.name_en}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 overflow-x-auto scrollbar-hide px-4 py-3 border-b border-tide-300/10">
        {DETAIL_TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-3 py-2 text-xs font-semibold flex-shrink-0 rounded-xl transition-all ${tab === i ? 'gradient-tide text-white' : 'text-foam/50'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* Übersicht */}
        {tab === 0 && (
          <>
            {fish.description_de && <p className="text-foam/70 text-sm leading-relaxed">{fish.description_de}</p>}
            <div className="grid grid-cols-2 gap-2">
              {fish.depth_min_m != null && <div className="glass-card rounded-xl p-3"><p className="text-foam/40 text-xs">Tiefe</p><p className="text-foam font-bold text-sm">{fish.depth_min_m}–{fish.depth_max_m ?? '?'} m</p></div>}
              {fish.water_temp_min_c != null && <div className="glass-card rounded-xl p-3"><p className="text-foam/40 text-xs">Wassertemp</p><p className="text-foam font-bold text-sm">{fish.water_temp_min_c}–{fish.water_temp_max_c ?? '?'}°C</p></div>}
              {fish.max_length_cm && <div className="glass-card rounded-xl p-3"><p className="text-foam/40 text-xs">Max Länge</p><p className="text-foam font-bold text-sm">{fish.max_length_cm} cm</p></div>}
              {fish.record_weight_kg && <div className="glass-card rounded-xl p-3"><p className="text-foam/40 text-xs">Rekordgewicht</p><p className="text-foam font-bold text-sm">{fish.record_weight_kg} kg</p></div>}
            </div>
            {fish.best_months?.length > 0 && (
              <div className="glass-card rounded-xl p-4">
                <p className="text-foam/40 text-xs mb-2">Beste Monate</p>
                <div className="flex gap-1.5 flex-wrap">
                  {MONTH_NAMES.map((m, idx) => (
                    <span key={m} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold ${fish.best_months.includes(idx + 1) ? 'gradient-tide text-white' : 'bg-abyss-700 text-foam/30'}`}>{m}</span>
                  ))}
                </div>
              </div>
            )}
            {fish.protection_status && <div className="glass-card rounded-xl p-3 flex items-center justify-between"><span className="text-foam/50 text-xs">Schutzstatus</span><span className="text-foam text-xs font-semibold">{fish.protection_status}</span></div>}
            {fish.fun_facts_de?.length > 0 && <div className="glass-card rounded-xl p-4"><p className="text-foam/40 text-xs mb-2">Fun Facts</p>{fish.fun_facts_de.map((f, i) => <p key={i} className="text-foam/60 text-xs mb-1">• {f}</p>)}</div>}
          </>
        )}

        {/* Erkennung */}
        {tab === 1 && (
          <>
            {fish.identification_tips_de && <p className="text-foam/70 text-sm leading-relaxed">{fish.identification_tips_de}</p>}
            {fish.male_female_differences_de && <div className="glass-card rounded-xl p-4"><p className="text-foam/40 text-xs mb-1">♂ / ♀ Unterschiede</p><p className="text-foam/60 text-sm">{fish.male_female_differences_de}</p></div>}
            {fish.danger_notes_de && <div className="glass-card rounded-xl p-4 border border-coral-500/20"><p className="text-coral-500 text-xs font-bold mb-1">⚠️ Achtung</p><p className="text-foam/60 text-sm">{fish.danger_notes_de}</p></div>}
          </>
        )}

        {/* Technik */}
        {tab === 2 && (
          <>
            {fish.best_time_of_day?.length > 0 && <div className="glass-card rounded-xl p-4"><p className="text-foam/40 text-xs mb-2">Beste Tageszeit</p><div className="flex flex-wrap gap-2">{fish.best_time_of_day.map(t => <span key={t} className="px-2.5 py-1 bg-abyss-700 text-foam/70 rounded-xl text-xs">{t}</span>)}</div></div>}
            {fish.recommended_technique?.length > 0 && <div className="glass-card rounded-xl p-4"><p className="text-foam/40 text-xs mb-2">Techniken</p>{fish.recommended_technique.map(t => <p key={t} className="text-foam font-semibold text-sm mb-1">• {t}</p>)}</div>}
            {fish.recommended_lure?.length > 0 && <div className="glass-card rounded-xl p-4"><p className="text-foam/40 text-xs mb-2">Köder</p>{fish.recommended_lure.map(l => <p key={l} className="text-tide-400 text-sm mb-1">• {l}</p>)}</div>}
            {fish.preferred_structure && <div className="glass-card rounded-xl p-3"><p className="text-foam/40 text-xs mb-1">Bevorzugte Struktur</p><p className="text-foam/70 text-sm">{fish.preferred_structure}</p></div>}
            {fish.current_preference && <div className="glass-card rounded-xl p-3"><p className="text-foam/40 text-xs mb-1">Strömung</p><p className="text-foam/70 text-sm">{fish.current_preference}</p></div>}
            {fish.barometric_preference && <div className="glass-card rounded-xl p-3"><p className="text-foam/40 text-xs mb-1">Luftdruck</p><p className="text-foam/70 text-sm">{fish.barometric_preference}</p></div>}
            {fish.fight_characteristics_de && <div className="glass-card rounded-xl p-4"><p className="text-foam/40 text-xs mb-1">Kampfverhalten</p><p className="text-foam/60 text-sm">{fish.fight_characteristics_de}</p></div>}
          </>
        )}

        {/* Ausrüstung */}
        {tab === 3 && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {fish.equipment_class && <div className="glass-card rounded-xl p-3"><p className="text-foam/40 text-xs">Ausrüstungsklasse</p><p className="text-foam font-bold text-sm capitalize">{fish.equipment_class}</p></div>}
              {fish.difficulty_rating && <div className="glass-card rounded-xl p-3"><p className="text-foam/40 text-xs">Schwierigkeit</p><p className="text-foam font-bold text-sm">{fish.difficulty_rating}/10</p></div>}
              {fish.line_strength_min_kg && <div className="glass-card rounded-xl p-3"><p className="text-foam/40 text-xs">Schnur</p><p className="text-foam font-bold text-sm">{fish.line_strength_min_kg}–{fish.line_strength_max_kg} kg</p></div>}
              {fish.hook_size && <div className="glass-card rounded-xl p-3"><p className="text-foam/40 text-xs">Hakengröße</p><p className="text-foam font-bold text-sm">{fish.hook_size}</p></div>}
            </div>
            {fish.leader_type && <div className="glass-card rounded-xl p-3"><p className="text-foam/40 text-xs mb-1">Vorfach</p><p className="text-foam/70 text-sm">{fish.leader_type}</p></div>}
            {fish.knot_recommendation && <div className="glass-card rounded-xl p-3"><p className="text-foam/40 text-xs mb-1">Empfohlener Knoten</p><p className="text-foam/70 text-sm">{fish.knot_recommendation}</p></div>}
          </>
        )}

        {/* Küche */}
        {tab === 4 && (
          <>
            <div className="flex items-center gap-3 glass-card rounded-xl p-4">
              <div className="text-2xl">🍽️</div>
              <div><p className="text-foam/40 text-xs">Genießbarkeit</p><div className="flex gap-0.5 mt-0.5">{Array.from({ length: 5 }).map((_, i) => <span key={i} className={`text-sm ${i < (fish.edibility_rating || 0) ? 'text-sun-400' : 'text-foam/20'}`}>★</span>)}</div></div>
            </div>
            {fish.culinary_tips_de && <p className="text-foam/60 text-sm leading-relaxed">{fish.culinary_tips_de}</p>}
            {fish.min_size_cm && <div className="glass-card rounded-xl p-3 flex justify-between"><span className="text-foam/40 text-xs">Mindestmaß</span><span className="text-foam font-bold text-sm">{fish.min_size_cm} cm</span></div>}
          </>
        )}
      </div>
      <div className="h-6" />
    </motion.div>
  );
}

export default function FishEncyclopediaPage() {
  const [fish, setFish] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filterHabitat, setFilterHabitat] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.FishEncyclopedia.list('name_de', 500).then(d => { setFish(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = fish.filter(f => {
    const q = query.toLowerCase();
    if (q && !(f.name_de || '').toLowerCase().includes(q) && !(f.name_en || '').toLowerCase().includes(q)) return false;
    if (filterHabitat !== 'all' && !(f.habitat || []).includes(filterHabitat)) return false;
    if (filterRarity !== 'all' && f.rarity !== filterRarity) return false;
    return true;
  });

  const habitats = [...new Set(fish.flatMap(f => f.habitat || []))].sort();

  if (loading) return <PageTransition><div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" /></div></PageTransition>;

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div>
          <p className="text-foam/50 text-sm">Alle Arten</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">Fischlexikon</h1>
        </div>

        <div className="glass-card rounded-2xl flex items-center gap-3 px-4 py-3">
          <Search className="w-4 h-4 text-tide-400 flex-shrink-0" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Art suchen (DE / EN)..."
            className="bg-transparent flex-1 text-foam placeholder-foam/30 text-sm outline-none" />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <select value={filterHabitat} onChange={e => setFilterHabitat(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-abyss-700 text-foam/70 border border-tide-300/15 flex-shrink-0">
            <option value="all">Alle Lebensräume</option>
            {habitats.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          {['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'].map(r => (
            <button key={r} onClick={() => setFilterRarity(r)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${filterRarity === r ? 'gradient-tide text-white' : 'glass-card text-foam/60'}`}>
              {r === 'all' ? 'Alle' : (RARITY_CFG[r]?.label || r)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center mt-8">
            <div className="text-5xl mb-4">🐟</div>
            <p className="font-display font-bold text-foam text-lg">Keine Arten gefunden</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((f, i) => {
              const rc = RARITY_CFG[f.rarity] || RARITY_CFG.common;
              return (
                <motion.button key={f.id} onClick={() => setSelected(f)}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="glass-card rounded-2xl overflow-hidden text-left">
                  <div className="h-28 relative bg-abyss-800">
                    {f.image_url
                      ? <img src={f.image_url} alt={f.name_de} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl">🐟</div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-abyss-950/80 to-transparent" />
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                      style={{ background: rc.bg, color: rc.color }}>{rc.label}</span>
                  </div>
                  <div className="p-2.5">
                    <p className="font-display font-bold text-foam text-sm leading-tight">{f.name_de}</p>
                    <p className="text-foam/30 italic text-[10px] truncate">{f.name_latin || f.name_en}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
      <AnimatePresence>
        {selected && <DetailView fish={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </PageTransition>
  );
}