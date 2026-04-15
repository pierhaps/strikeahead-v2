import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, MapPin, Euro } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';

const tideEase = [0.2, 0.8, 0.2, 1];

const LICENSE_TYPE_DE = { daily: 'Tageslizenz', weekly: 'Wochenlizenz', monthly: 'Monatslizenz', yearly: 'Jahreslizenz', multi_year: 'Mehrjahreslizenz', lifetime: 'Lebenslang', tourist: 'Touristenlizenz' };

export default function LicenseSearch() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    base44.entities.WaterLicense.list('water_name', 500).then(d => { setLicenses(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = licenses.filter(l => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (l.water_name || '').toLowerCase().includes(q) ||
      (l.location || '').toLowerCase().includes(q) ||
      (l.country || '').toLowerCase().includes(q);
  });

  if (loading) return <PageTransition><div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" /></div></PageTransition>;

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div>
          <p className="text-foam/50 text-sm">Angellizenzen finden</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">Lizenz-Suche</h1>
        </div>

        <div className="glass-card rounded-2xl flex items-center gap-3 px-4 py-3">
          <Search className="w-4 h-4 text-tide-400 flex-shrink-0" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Gewässer, Ort oder Land suchen..."
            className="bg-transparent flex-1 text-foam placeholder-foam/30 text-sm outline-none" />
        </div>

        {filtered.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center mt-8">
            <div className="text-5xl mb-4">🎫</div>
            <p className="font-display font-bold text-foam text-lg">Keine Lizenzen gefunden</p>
            <p className="text-foam/40 text-sm mt-2">Anderen Suchbegriff versuchen</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, ease: tideEase }}
                className="glass-card rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-display font-bold text-foam">{l.water_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-foam/40" />
                      <p className="text-foam/50 text-xs">{l.location}{l.country ? `, ${l.country}` : ''}</p>
                    </div>
                  </div>
                  {l.price != null && (
                    <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl flex-shrink-0"
                      style={{ background: 'rgba(245,195,75,0.12)', border: '1px solid rgba(245,195,75,0.25)' }}>
                      <Euro className="w-3 h-3 text-sun-400" />
                      <span className="font-display font-bold text-sun-400 text-sm">{l.price}</span>
                    </div>
                  )}
                </div>

                {l.license_type && (
                  <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-tide-500/12 text-tide-300 border border-tide-400/20 mb-2">
                    {LICENSE_TYPE_DE[l.license_type] || l.license_type}
                  </span>
                )}

                {l.regulations && <p className="text-foam/50 text-xs mb-3 leading-relaxed">{l.regulations}</p>}

                {l.species_allowed?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {l.species_allowed.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-abyss-700 text-foam/50 rounded-lg text-[10px]">{s}</span>
                    ))}
                  </div>
                )}

                {l.hejfish_url && (
                  <a href={l.hejfish_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl gradient-tide text-white font-bold text-sm glow-tide">
                    <ExternalLink className="w-4 h-4" /> Bei HejFish kaufen
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