import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Layers, Filter, Crosshair, Search, X, ChevronUp, Thermometer, Fish } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';

const tideEase = [0.2, 0.8, 0.2, 1];

const hotspots = [
  { id: 1, name: 'Schweriner See Nord', heat: 0.88, x: 38, y: 28, catches: 142, topSpecies: 'Hecht' },
  { id: 2, name: 'Bodden West', heat: 0.72, x: 65, y: 45, catches: 87, topSpecies: 'Zander' },
  { id: 3, name: 'Tollensesee Mitte', heat: 0.55, x: 25, y: 62, catches: 63, topSpecies: 'Barsch' },
  { id: 4, name: 'Müritz Süd', heat: 0.91, x: 55, y: 22, catches: 198, topSpecies: 'Hecht' },
  { id: 5, name: 'Elbe Abschnitt 7', heat: 0.45, x: 80, y: 68, catches: 34, topSpecies: 'Aal' },
  { id: 6, name: 'Kiesgrube Pinnow', heat: 0.62, x: 42, y: 78, catches: 51, topSpecies: 'Karpfen' },
];

const categories = ['Alle', 'Süßwasser', 'Salzwasser', 'Forelle', 'Hecht', 'Zander'];

function getHeatColor(heat) {
  if (heat >= 0.75) return { pin: '#F5C34B', glow: 'rgba(245,195,75,0.5)', label: 'Sehr heiß' };
  if (heat >= 0.5) return { pin: '#4DC3D1', glow: 'rgba(77,195,209,0.4)', label: 'Aktiv' };
  return { pin: '#7FDCE5', glow: 'rgba(127,220,229,0.3)', label: 'Ruhig' };
}

export default function Map() {
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Alle');

  return (
    <PageTransition>
      <div className="relative h-dvh overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 100% 80% at 50% 60%, #0A3244 0%, #021521 70%)' }}>
          {/* Contour lines */}
          {[20,30,40,50,60,70,80,90].map(r => (
            <div key={r}
              className="absolute rounded-full border border-tide-500/5"
              style={{ width: `${r}%`, height: `${r * 0.7}%`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            />
          ))}
          {/* Grid */}
          {[20,40,60,80].map(x => (
            <div key={x} className="absolute top-0 bottom-0 border-l border-tide-500/5" style={{ left: `${x}%` }} />
          ))}
          {[20,40,60,80].map(y => (
            <div key={y} className="absolute left-0 right-0 border-t border-tide-500/5" style={{ top: `${y}%` }} />
          ))}
        </div>

        {/* Hotspot Pins */}
        {hotspots.map((spot) => {
          const hc = getHeatColor(spot.heat);
          return (
            <motion.button
              key={spot.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: spot.id * 0.08, ease: tideEase }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedSpot(spot)}
              className="absolute"
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: spot.id * 0.3 }}
                  className="absolute w-10 h-10 rounded-full"
                  style={{ background: hc.glow }}
                />
                <div className="w-8 h-8 rounded-full flex items-center justify-center relative z-10 shadow-lg"
                  style={{ background: hc.pin }}>
                  <MapPin className="w-4 h-4 text-abyss-950" strokeWidth={2.5} />
                </div>
              </div>
            </motion.button>
          );
        })}

        {/* Search Bar */}
        <div className="absolute top-0 left-0 right-0 px-4 pt-4" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
          <div className="glass-strong rounded-2xl flex items-center gap-3 px-4 py-3">
            <Search className="w-4 h-4 text-tide-400 flex-shrink-0" />
            <input
              placeholder="Gewässer oder Spot suchen..."
              className="bg-transparent flex-1 text-foam placeholder-foam/30 text-sm outline-none"
            />
          </div>
        </div>

        {/* Category Chips */}
        <div className="absolute left-0 right-0 flex gap-2 px-4 overflow-x-auto scrollbar-hide"
          style={{ top: 'calc(max(1rem, env(safe-area-inset-top)) + 60px)' }}>
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? 'gradient-tide text-white'
                  : 'glass-strong text-foam/60'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Right FABs */}
        <div className="absolute right-4 flex flex-col gap-2.5" style={{ top: 'calc(max(1rem, env(safe-area-inset-top)) + 130px)' }}>
          {[{ Icon: Layers, label: 'Layer' }, { Icon: Filter, label: 'Filter' }].map(({ Icon, label }) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.93 }}
              className="w-11 h-11 glass-strong rounded-2xl flex items-center justify-center"
            >
              <Icon className="w-5 h-5 text-tide-400" />
            </motion.button>
          ))}
        </div>

        {/* Bottom-right crosshair */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          className="absolute bottom-24 right-4 w-12 h-12 gradient-tide rounded-2xl flex items-center justify-center glow-tide"
        >
          <Crosshair className="w-5 h-5 text-white" />
        </motion.button>

        {/* Bottom Sheet */}
        <AnimatePresence>
          {selectedSpot && (() => {
            const hc = getHeatColor(selectedSpot.heat);
            return (
              <motion.div
                key="sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                className="absolute bottom-0 left-0 right-0 glass-strong rounded-t-3xl p-5"
                style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
              >
                <div className="w-10 h-1 bg-foam/20 rounded-full mx-auto mb-4" />
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-foam text-lg">{selectedSpot.name}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                      style={{ background: hc.glow, color: hc.pin }}>
                      {hc.label}
                    </span>
                  </div>
                  <button onClick={() => setSelectedSpot(null)}
                    className="w-8 h-8 glass-card rounded-xl flex items-center justify-center">
                    <X className="w-4 h-4 text-foam/50" />
                  </button>
                </div>

                <div className="flex gap-3 mb-4">
                  <div className="flex-1 glass-card rounded-2xl p-3 text-center">
                    <p className="font-display font-bold text-xl text-gradient-tide">{selectedSpot.catches}</p>
                    <p className="text-foam/40 text-xs">Fänge</p>
                  </div>
                  <div className="flex-1 glass-card rounded-2xl p-3 text-center">
                    <p className="font-display font-bold text-xl text-gradient-sun">{Math.round(selectedSpot.heat * 100)}%</p>
                    <p className="text-foam/40 text-xs">Aktivität</p>
                  </div>
                  <div className="flex-1 glass-card rounded-2xl p-3 text-center">
                    <p className="font-display font-bold text-xl text-foam">{selectedSpot.topSpecies}</p>
                    <p className="text-foam/40 text-xs">Top Art</p>
                  </div>
                </div>

                {/* Heat bar */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-foam/50 text-xs">Aktivitäts-Score</span>
                    <span className="text-xs font-bold" style={{ color: hc.pin }}>{Math.round(selectedSpot.heat * 100)}%</span>
                  </div>
                  <div className="h-2 bg-abyss-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${hc.pin}, ${hc.glow})` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedSpot.heat * 100}%` }}
                      transition={{ duration: 0.8, ease: tideEase }}
                    />
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-2xl gradient-tide font-display font-bold text-white glow-tide"
                >
                  Spot öffnen →
                </motion.button>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}