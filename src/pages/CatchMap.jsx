import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Navigation, X } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SPECIES_COLORS = ['#1FA7B8', '#F5C34B', '#4DC3D1', '#FF6B5B', '#7FDCE5', '#FFD872', '#1FA7B8'];

function createColorIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
    iconSize: [22, 22], iconAnchor: [11, 11],
  });
}

function LocationButton() {
  const map = useMap();
  return (
    <button onClick={() => map.locate({ setView: true, maxZoom: 14 })}
      className="absolute bottom-24 right-4 z-[1000] w-12 h-12 rounded-full glass-strong border border-tide-300/20 flex items-center justify-center glow-tide shadow-xl">
      <Navigation className="w-5 h-5 text-tide-400" />
    </button>
  );
}

export default function CatchMap() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterSpecies, setFilterSpecies] = useState('all');
  const [filterRange, setFilterRange] = useState('all');

  useEffect(() => {
    base44.entities.Catch.list('-caught_date', 500).then(data => {
      setCatches((data || []).filter(c => c.gps_lat && c.gps_lon));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const allSpecies = [...new Set(catches.map(c => c.species).filter(Boolean))];
  const speciesColorMap = Object.fromEntries(allSpecies.map((s, i) => [s, SPECIES_COLORS[i % SPECIES_COLORS.length]]));
  const now = new Date();
  const filtered = catches.filter(c => {
    if (filterSpecies !== 'all' && c.species !== filterSpecies) return false;
    if (filterRange !== 'all') {
      const d = c.caught_date ? new Date(c.caught_date) : new Date(c.created_date);
      const days = { '7d': 7, '30d': 30, '90d': 90 };
      if ((now - d) / 86400000 > days[filterRange]) return false;
    }
    return true;
  });
  const center = filtered.length > 0 ? [filtered[0].gps_lat, filtered[0].gps_lon] : [51.5, 10.0];

  return (
    <PageTransition>
      <div className="relative h-dvh w-full overflow-hidden">
        <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2 overflow-x-auto scrollbar-hide">
          <select value={filterSpecies} onChange={e => setFilterSpecies(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-abyss-900/90 text-foam border border-tide-300/20 flex-shrink-0 backdrop-blur">
            <option value="all">{t('catches.all_species')}</option>
            {allSpecies.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {['all','7d','30d','90d'].map(r => (
            <button key={r} onClick={() => setFilterRange(r)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${filterRange === r ? 'gradient-tide text-white shadow-lg' : 'bg-abyss-900/85 text-foam/70 border border-tide-300/15 backdrop-blur'}`}>
              {r === 'all' ? t('common.all') : r}
            </button>
          ))}
          <div className="px-3 py-2 rounded-xl text-xs font-semibold bg-abyss-900/85 text-tide-400 border border-tide-300/15 backdrop-blur flex-shrink-0">
            {filtered.length} {t('catchmap.pins')}
          </div>
        </div>

        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-abyss-950">
            <div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center bg-abyss-950">
            <div className="text-center">
              <div className="text-5xl mb-4">🗺️</div>
              <p className="font-display font-bold text-foam">{t('catchmap.empty_title')}</p>
              <p className="text-foam/40 text-sm mt-2">{t('catchmap.empty_sub')}</p>
            </div>
          </div>
        ) : (
          <MapContainer center={center} zoom={7} style={{ width: '100%', height: '100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CartoDB' />
            {filtered.map(c => (
              <Marker key={c.id} position={[c.gps_lat, c.gps_lon]}
                icon={createColorIcon(speciesColorMap[c.species] || '#1FA7B8')}
                eventHandlers={{ click: () => setSelected(c) }} />
            ))}
            <LocationButton />
          </MapContainer>
        )}

        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-24 left-4 right-4 z-[1000] glass-strong rounded-2xl p-4 border border-tide-300/20">
              <button onClick={() => setSelected(null)} className="absolute top-3 right-3 text-foam/40 hover:text-foam">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                {selected.photo_urls?.[0] && (
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={selected.photo_urls[0]} alt={selected.species} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-foam">{selected.species || t('common.unknown')}</p>
                  <p className="text-foam/40 text-xs">{selected.caught_date}</p>
                  {selected.waterbody && <p className="text-tide-400 text-xs">{selected.waterbody}</p>}
                </div>
                {selected.weight_kg && (
                  <div className="text-right flex-shrink-0">
                    <p className="font-display font-bold text-sun-400">{selected.weight_kg} kg</p>
                    {selected.length_cm && <p className="text-foam/40 text-xs">{selected.length_cm} cm</p>}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}