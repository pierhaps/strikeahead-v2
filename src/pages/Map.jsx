import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Navigation, X, Search, Fish, MapPin } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const tideEase = [0.2, 0.8, 0.2, 1];

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SPECIES_COLORS = {
  Hecht: '#B6F03C', Zander: '#2DA8FF', Barsch: '#F5C34B', Karpfen: '#FF6B5B',
  Forelle: '#2EE0C9', Wels: '#7FDCE5', Dorsch: '#4DC3D1', Makrele: '#0EBDD8',
};

function createCatchIcon(color, hasPhoto) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px; height:28px; border-radius:50%;
      background: ${color};
      border: 2.5px solid rgba(255,255,255,0.9);
      box-shadow: 0 2px 10px rgba(0,0,0,0.4), 0 0 16px ${color}44;
      display:flex; align-items:center; justify-content:center;
    ">
      <span style="font-size:13px">${hasPhoto ? '📸' : '🐟'}</span>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function LocationButton() {
  const map = useMap();
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={() => map.locate({ setView: true, maxZoom: 14 })}
      className="absolute bottom-28 right-4 z-[1000] w-12 h-12 rounded-full liquid-glass flex items-center justify-center"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 12px rgba(46,224,201,0.25)' }}
    >
      <Navigation className="w-5 h-5 text-tide-400" />
    </motion.button>
  );
}

function FitBounds({ catches }) {
  const map = useMap();
  useEffect(() => {
    if (catches.length === 0) return;
    const bounds = L.latLngBounds(catches.map(c => [c.gps_lat, c.gps_lon]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }, [catches, map]);
  return null;
}

export default function MapPage() {
  const { t } = useTranslation();
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterSpecies, setFilterSpecies] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.entities.Catch.list('-caught_date', 500)
      .then(data => {
        setCatches((data || []).filter(c => c.gps_lat && c.gps_lon));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const allSpecies = useMemo(
    () => [...new Set(catches.map(c => c.species).filter(Boolean))].sort(),
    [catches]
  );

  const filtered = useMemo(() => {
    let list = catches;
    if (filterSpecies !== 'all') list = list.filter(c => c.species === filterSpecies);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        (c.species || '').toLowerCase().includes(q) ||
        (c.waterbody || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [catches, filterSpecies, search]);

  const center = filtered.length > 0
    ? [filtered[0].gps_lat, filtered[0].gps_lon]
    : [51.3, 10.4]; // Germany center

  return (
    <PageTransition>
      <div className="relative h-dvh w-full overflow-hidden">
        {/* Map */}
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-navy-900">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-foam/40 text-sm">{t('map.loading', { defaultValue: 'Loading map...' })}</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={filtered.length > 0 ? 8 : 6}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com">CARTO</a>'
            />
            {filtered.map(c => {
              const color = SPECIES_COLORS[c.species] || '#2DA8FF';
              const hasPhoto = c.photo_urls && c.photo_urls.length > 0;
              return (
                <Marker
                  key={c.id}
                  position={[c.gps_lat, c.gps_lon]}
                  icon={createCatchIcon(color, hasPhoto)}
                  eventHandlers={{ click: () => setSelected(c) }}
                />
              );
            })}
            {filtered.length > 1 && <FitBounds catches={filtered} />}
            <LocationButton />
          </MapContainer>
        )}

        {/* Search + filters overlay */}
        <div
          className="absolute top-0 left-0 right-0 z-[1000] px-4 space-y-2"
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
        >
          {/* Search bar */}
          <div className="liquid-glass rounded-2xl flex items-center gap-3 px-4 py-3">
            <Search className="w-4 h-4 text-foam/40 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('map.search_placeholder', { defaultValue: 'Search species or waterbody...' })}
              className="bg-transparent flex-1 text-foam placeholder-foam/25 text-sm outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X className="w-4 h-4 text-foam/40" />
              </button>
            )}
          </div>

          {/* Species filter chips */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setFilterSpecies('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterSpecies === 'all'
                  ? 'gradient-tide text-navy-900'
                  : 'liquid-glass-subtle text-foam/50'
              }`}
            >
              {t('common.all', { defaultValue: 'All' })} ({catches.length})
            </button>
            {allSpecies.slice(0, 8).map(species => (
              <button
                key={species}
                onClick={() => setFilterSpecies(species === filterSpecies ? 'all' : species)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filterSpecies === species
                    ? 'gradient-tide text-navy-900'
                    : 'liquid-glass-subtle text-foam/50'
                }`}
              >
                {species}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {!loading && catches.length === 0 && (
          <div className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none">
            <div className="text-center px-8">
              <div className="w-16 h-16 rounded-full liquid-glass mx-auto mb-4 flex items-center justify-center">
                <MapPin className="w-7 h-7 text-tide-400" />
              </div>
              <p className="font-display font-bold text-foam text-lg mb-1">
                {t('map.empty_title', { defaultValue: 'No catches on map yet' })}
              </p>
              <p className="text-foam/40 text-sm">
                {t('map.empty_sub', { defaultValue: 'Log a catch with GPS to see it here' })}
              </p>
            </div>
          </div>
        )}

        {/* Selected catch sheet */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 z-[1000] liquid-glass-heavy rounded-t-3xl p-5"
              style={{
                paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
                background: 'linear-gradient(180deg, rgba(14,30,48,0.85) 0%, rgba(10,24,40,0.75) 100%)',
              }}
            >
              <div className="w-10 h-1 bg-foam/15 rounded-full mx-auto mb-4" />

              <div className="flex items-center gap-4">
                {/* Photo */}
                {selected.photo_urls?.[0] ? (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={selected.photo_urls[0]} alt={selected.species} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-navy-700">
                    <Fish className="w-7 h-7 text-tide-400" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-foam text-lg">{selected.species || t('common.unknown')}</p>
                  {selected.waterbody && (
                    <p className="text-tide-400 text-xs flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {selected.waterbody}
                    </p>
                  )}
                  <p className="text-foam/35 text-xs mt-0.5">{selected.caught_date || ''}</p>
                </div>

                {/* Weight/length + close */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-full liquid-glass-subtle flex items-center justify-center">
                    <X className="w-4 h-4 text-foam/50" />
                  </button>
                  {selected.weight_kg && (
                    <p className="font-display font-bold text-sun-400 text-lg">{selected.weight_kg} kg</p>
                  )}
                  {selected.length_cm && (
                    <p className="text-foam/50 text-xs">{selected.length_cm} cm</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
