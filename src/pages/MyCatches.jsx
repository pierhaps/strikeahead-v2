import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wind, Thermometer, Shield } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { computeTrustScore, trustMeta } from '../utils/trustEngine';

const tideEase = [0.2, 0.8, 0.2, 1];

function DetailSheet({ catch: c, onClose, t }) {
  if (!c) return null;
  // Prefer stored verification fields if present, fall back to local trust engine
  const local = computeTrustScore(c);
  const effectiveLevel = c.verification_level || local.level;
  const effectiveScore = c.verification_score != null ? c.verification_score : local.score;
  const VERIFICATION_LABELS = {
    unverified: { label: t('catches.verify_unverified'), color: 'text-foam/40' },
    photo_verified: { label: t('catches.verify_photo'), color: 'text-tide-400' },
    gps_verified: { label: t('catches.verify_gps'), color: 'text-tide-300' },
    fully_verified: { label: t('catches.verify_full'), color: 'text-sun-400' },
  };
  const vl = VERIFICATION_LABELS[effectiveLevel] || VERIFICATION_LABELS.unverified;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(2,21,33,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="glass-strong rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-foam/20 rounded-full mx-auto mb-4" />
        {c.photo_urls?.[0] && (
          <div className="h-52 rounded-2xl overflow-hidden mb-4">
            <img src={c.photo_urls[0]} alt={c.species} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-foam text-xl">{c.species || t('common.unknown')}</h2>
            <p className="text-foam/40 text-sm">{c.caught_date} {c.caught_time ? `· ${c.caught_time}` : ''}</p>
          </div>
          <div className="text-right">
            {c.weight_kg && <p className="font-display font-extrabold text-sun-400 text-xl">{c.weight_kg} kg</p>}
            {c.length_cm && <p className="text-foam/50 text-sm">{c.length_cm} cm</p>}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-tide-400" />
            <span className="text-foam text-sm font-semibold">Trust-Score</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${vl.color}`}>{vl.label}</span>
            <span className="text-foam/60 text-xs">({effectiveScore}/100)</span>
          </div>
        </div>
        {(c.technique || c.bait_category) && (
          <div className="glass-card rounded-2xl p-3 mb-4">
            <p className="text-foam/40 text-xs uppercase tracking-widest mb-2">{t('catches.bait_technique')}</p>
            <div className="flex flex-wrap gap-2">
              {c.technique && <span className="px-2.5 py-1 bg-tide-500/15 text-tide-300 rounded-xl text-xs">{c.technique}</span>}
              {c.bait_category && <span className="px-2.5 py-1 bg-abyss-700 text-foam/60 rounded-xl text-xs">{c.bait_category}</span>}
              {c.lure_color && <span className="px-2.5 py-1 bg-abyss-700 text-foam/60 rounded-xl text-xs">{c.lure_color}</span>}
              {c.model && <span className="px-2.5 py-1 bg-abyss-700 text-foam/60 rounded-xl text-xs">{c.model}</span>}
            </div>
          </div>
        )}
        {(c.air_temp_c || c.wind_speed_kmh || c.water_temp_c) && (
          <div className="glass-card rounded-2xl p-3 mb-4">
            <p className="text-foam/40 text-xs uppercase tracking-widest mb-2">{t('catches.weather_data')}</p>
            <div className="grid grid-cols-3 gap-2">
              {c.air_temp_c && <div className="text-center"><Thermometer className="w-4 h-4 text-tide-400 mx-auto mb-1" /><p className="text-foam font-bold text-sm">{c.air_temp_c}°C</p><p className="text-foam/30 text-[10px]">{t('catches.air')}</p></div>}
              {c.water_temp_c && <div className="text-center"><Thermometer className="w-4 h-4 text-tide-300 mx-auto mb-1" /><p className="text-foam font-bold text-sm">{c.water_temp_c}°C</p><p className="text-foam/30 text-[10px]">{t('catches.water')}</p></div>}
              {c.wind_speed_kmh && <div className="text-center"><Wind className="w-4 h-4 text-foam/50 mx-auto mb-1" /><p className="text-foam font-bold text-sm">{c.wind_speed_kmh} km/h</p><p className="text-foam/30 text-[10px]">{c.wind_direction || t('catches.wind')}</p></div>}
            </div>
          </div>
        )}
        {c.description && <p className="text-foam/60 text-sm leading-relaxed mb-4">{c.description}</p>}
        <button onClick={onClose} className="w-full py-3.5 rounded-2xl glass-card text-foam/70 font-semibold">{t('common.close')}</button>
      </motion.div>
    </motion.div>
  );
}

export default function MyCatches() {
  const { t } = useTranslation();
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterSpecies, setFilterSpecies] = useState('all');
  const [filterWater, setFilterWater] = useState('all');
  const [filterReleased, setFilterReleased] = useState('all');
  const [filterRange, setFilterRange] = useState('all');

  useEffect(() => {
    base44.entities.Catch.list('-caught_date', 200).then(data => {
      setCatches(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const now = new Date();
  const rangeCutoff = { '7d': 7, '30d': 30, '90d': 90, 'all': 99999 };
  const filtered = catches.filter(c => {
    if (filterSpecies !== 'all' && c.species !== filterSpecies) return false;
    if (filterWater !== 'all' && c.waterbody !== filterWater) return false;
    if (filterReleased === 'released' && !c.released) return false;
    if (filterReleased === 'kept' && c.released) return false;
    if (filterRange !== 'all') {
      const d = c.caught_date ? new Date(c.caught_date) : new Date(c.created_date);
      if ((now - d) / 86400000 > rangeCutoff[filterRange]) return false;
    }
    return true;
  });

  const allSpecies = [...new Set(catches.map(c => c.species).filter(Boolean))];
  const allWaters = [...new Set(catches.map(c => c.waterbody).filter(Boolean))];

  if (loading) return (
    <PageTransition><div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" />
    </div></PageTransition>
  );

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foam/50 text-sm">{t('catches.subtitle')}</p>
            <h1 className="font-display text-2xl font-extrabold text-foam">{t('catches.myCatches')}</h1>
          </div>
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold glass-card text-tide-400">{filtered.length}</span>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <select value={filterSpecies} onChange={e => setFilterSpecies(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-abyss-700 text-foam/70 border border-tide-300/15 flex-shrink-0">
            <option value="all">{t('catches.all_species')}</option>
            {allSpecies.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterWater} onChange={e => setFilterWater(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-abyss-700 text-foam/70 border border-tide-300/15 flex-shrink-0">
            <option value="all">{t('catches.all_waters')}</option>
            {allWaters.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          {['all','7d','30d','90d'].map(r => (
            <button key={r} onClick={() => setFilterRange(r)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 ${filterRange === r ? 'gradient-tide text-white' : 'glass-card text-foam/60'}`}>
              {r === 'all' ? t('common.all') : r}
            </button>
          ))}
          {[
            { key: 'all', label: `🐟 ${t('common.all')}` },
            { key: 'released', label: `🔄 C&R` },
            { key: 'kept', label: `🍳 ${t('catches.kept')}` },
          ].map(r => (
            <button key={r.key} onClick={() => setFilterReleased(r.key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 ${filterReleased === r.key ? 'bg-tide-500/25 text-tide-300 border border-tide-400/30' : 'glass-card text-foam/60'}`}>
              {r.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center mt-8">
            <div className="text-5xl mb-4">🎣</div>
            <p className="font-display font-bold text-foam text-lg">{t('catches.empty_title')}</p>
            <p className="text-foam/40 text-sm mt-2 mb-6">{t('catches.empty_sub')}</p>
            <Link to="/upload" className="inline-block px-6 py-3 rounded-2xl gradient-tide text-white font-bold text-sm glow-tide">
              {t('catches.log_first')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((c, i) => {
              const { level: trustLevel } = computeTrustScore(c);
              const tMeta = trustMeta[trustLevel] || trustMeta.unverified;
              return (
                <motion.button key={c.id} onClick={() => setSelected(c)}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }} whileTap={{ scale: 0.97 }}
                  className="relative rounded-2xl overflow-hidden text-left h-44 bg-abyss-800">
                  {c.photo_urls?.[0]
                    ? <img src={c.photo_urls[0]} alt={c.species} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">🐟</div>
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-abyss-950 via-transparent to-transparent" />
                  <div className="absolute top-1.5 right-1.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${tMeta.color} ${tMeta.border}`}
                      style={{ background: 'rgba(2,21,33,0.55)' }}>
                      <Shield className="w-2.5 h-2.5" />
                      {t(tMeta.key)}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="text-white font-bold text-sm">{c.species || t('common.unknown')}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {c.weight_kg && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                          style={{ background: 'rgba(245,195,75,0.9)', color: '#021521' }}>{c.weight_kg} kg</span>
                      )}
                      {c.released && <span className="text-[10px] text-tide-300">C&R</span>}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {selected && <DetailSheet catch={selected} onClose={() => setSelected(null)} t={t} />}
        </AnimatePresence>
        <div className="h-4" />
      </div>
    </PageTransition>
  );
}