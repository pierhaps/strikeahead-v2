import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';

const tideEase = [0.2, 0.8, 0.2, 1];

export default function FishFamilies() {
  const { t } = useTranslation();
  const [fish, setFish] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFamily, setOpenFamily] = useState(null);

  useEffect(() => {
    base44.entities.FishEncyclopedia.list('fish_family', 500).then(d => { setFish(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  // Group by family
  const families = fish.reduce((acc, f) => {
    const fam = f.fish_family || 'Sonstige';
    if (!acc[fam]) acc[fam] = [];
    acc[fam].push(f);
    return acc;
  }, {});
  const familyNames = Object.keys(families).sort();

  if (loading) return <PageTransition><div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" /></div></PageTransition>;

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-3">
        <div>
          <p className="text-foam/50 text-sm">{t('families.subtitle')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('families.title')}</h1>
        </div>

        {familyNames.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center mt-8">
            <div className="text-5xl mb-4">🐠</div>
            <p className="font-display font-bold text-foam text-lg">{t('families.empty_title')}</p>
            <p className="text-foam/40 text-sm mt-2">{t('families.empty_desc')}</p>
          </div>
        ) : (
          familyNames.map((fam, i) => {
            const isOpen = openFamily === fam;
            const members = families[fam];
            return (
              <motion.div key={fam} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFamily(isOpen ? null : fam)}
                  className="w-full flex items-center gap-3 p-4 text-left">
                  <div className="w-10 h-10 rounded-xl gradient-tide flex items-center justify-center text-xl flex-shrink-0">🐟</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-foam italic">{fam}</p>
                    <p className="text-foam/40 text-xs">{members.length} {members.length === 1 ? t('families.label.species_singular') : t('families.label.species_plural')}</p>
                  </div>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown className="w-5 h-5 text-foam/40" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: tideEase }}
                      className="overflow-hidden border-t border-tide-300/10">
                      {members.map((f, j) => (
                        <div key={f.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-tide-300/5 last:border-0">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-abyss-700">
                            {f.image_url
                              ? <img src={f.image_url} alt={f.name_de} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-lg">🐟</div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foam font-semibold text-sm">{f.name_de}</p>
                            <p className="text-foam/30 italic text-xs truncate">{f.name_latin || f.name_en}</p>
                          </div>
                          <div>
                            {f.rarity && (
                              <span className="text-[10px] font-bold capitalize"
                                style={{ color: { common: '#4DC3D1', uncommon: '#7FDCE5', rare: '#F5C34B', epic: '#FF6B5B', legendary: '#FFD872' }[f.rarity] || '#4DC3D1' }}>
                                {f.rarity}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
        <div className="h-4" />
      </div>
    </PageTransition>
  );
}
