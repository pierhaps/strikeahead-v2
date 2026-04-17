import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Euro, Star, Fish, AlertTriangle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/ui/PageTransition';
import PaywallModal from '../components/shared/PaywallModal';
import { base44 } from '@/api/base44Client';
import { useEntitlement } from '@/hooks/useEntitlement';
import { useAnalytics } from '@/hooks/useAnalytics';

const tideEase = [0.2, 0.8, 0.2, 1];

// Icon mapping for natural/live baits by keyword
const NATURAL_ICONS = {
  sardine: '🐟', sardin: '🐟', anchovy: '🐟', anchovis: '🐟',
  shrimp: '🦐', garnele: '🦐', garnel: '🦐', prawn: '🦐',
  crab: '🦀', krebs: '🦀', krebse: '🦀',
  worm: '🪱', wurm: '🪱', würmer: '🪱', regenwurm: '🪱',
  squid: '🦑', tintenfisch: '🦑', calamari: '🦑',
  mussel: '🦪', muschel: '🦪',
  mackerel: '🐠', makrele: '🐠',
  default: '🐡',
};

function getBaitIcon(name) {
  const lower = (name || '').toLowerCase();
  for (const [key, emoji] of Object.entries(NATURAL_ICONS)) {
    if (key !== 'default' && lower.includes(key)) return emoji;
  }
  return NATURAL_ICONS.default;
}

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
  const { t } = useTranslation();
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
          {bait.image_url && bait.category === 'artificial' ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
              <img src={bait.image_url} alt={bait.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center text-4xl"
              style={{ background: 'rgba(14,30,48,0.8)', border: '1px solid rgba(127,220,229,0.15)' }}>
              {getBaitIcon(bait.name_de || bait.name)}
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
            <p className="text-foam/40 text-xs mb-1">{t('bait.rig_method')}</p>
            <p className="text-foam font-semibold text-sm">{bait.rigging_method}</p>
          </div>
        )}

        {bait.recommended_techniques?.length > 0 && (
          <div className="glass-card rounded-xl p-3 mb-3">
            <p className="text-foam/40 text-xs mb-2">{t('bait.techniques')}</p>
            <div className="flex flex-wrap gap-1.5">
              {bait.recommended_techniques.map(tech => (
                <span key={tech} className="px-2.5 py-1 bg-tide-500/15 text-tide-300 rounded-xl text-xs">{tech}</span>
              ))}
            </div>
          </div>
        )}

        {bait.recommended_species?.length > 0 && (
          <div className="glass-card rounded-xl p-3 mb-3">
            <p className="text-foam/40 text-xs mb-2">{t('bait.target_species')}</p>
            <div className="flex flex-wrap gap-1.5">
              {bait.recommended_species.map(s => (
                <span key={s} className="px-2.5 py-1 bg-abyss-700 text-foam/60 rounded-xl text-xs">{s}</span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mb-4">
          {bait.size && <div className="glass-card rounded-xl p-2 text-center"><p className="text-foam/30 text-[10px]">{t('bait.size')}</p><p className="text-foam font-bold text-xs">{bait.size}</p></div>}
          {bait.weight_g && <div className="glass-card rounded-xl p-2 text-center"><p className="text-foam/30 text-[10px]">{t('bait.weight')}</p><p className="text-foam font-bold text-xs">{bait.weight_g}g</p></div>}
          {bait.color && <div className="glass-card rounded-xl p-2 text-center"><p className="text-foam/30 text-[10px]">{t('bait.color')}</p><p className="text-foam font-bold text-xs truncate">{bait.color}</p></div>}
        </div>

        <button onClick={onClose} className="w-full py-3.5 rounded-2xl glass-card text-foam/70 font-semibold">{t('bait.close')}</button>
      </motion.div>
    </motion.div>
  );
}

// ── Artificial card — with product image ──
function ArtificialCard({ b, onClick }) {
  return (
    <motion.button onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.97 }}
      className="glass-card rounded-2xl overflow-hidden text-left">
      <div className="h-32 bg-abyss-800 relative">
        {b.image_url
          ? <img src={b.image_url} alt={b.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">🪝</div>
        }
        {b.rating >= 4.5 && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-lg text-[9px] font-bold bg-sun-400/90 text-abyss-950">TOP</span>
        )}
      </div>
      <div className="p-2.5 space-y-1">
        <p className="font-bold text-foam text-xs leading-tight line-clamp-2">{b.name_de || b.name}</p>
        {b.brand && <p className="text-foam/40 text-[10px]">{b.brand}</p>}
        <StarRating rating={b.rating} count={b.rating_count} />
        {b.price_eur && <p className="font-display font-bold text-sun-400 text-sm">{b.price_eur} €</p>}
      </div>
    </motion.button>
  );
}

// ── Natural / Live card — icon-based, no image ──
function IconCard({ b, onClick, color }) {
  const icon = getBaitIcon(b.name_de || b.name);
  return (
    <motion.button onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.97 }}
      className="glass-card rounded-2xl overflow-hidden text-left">
      <div className="h-24 flex items-center justify-center text-5xl"
        style={{ background: `linear-gradient(135deg, ${color}18 0%, rgba(14,30,48,0.6) 100%)`, borderBottom: `1px solid ${color}20` }}>
        {icon}
      </div>
      <div className="p-2.5 space-y-1">
        <p className="font-bold text-foam text-xs leading-tight line-clamp-2">{b.name_de || b.name}</p>
        {b.brand && <p className="text-foam/40 text-[10px]">{b.brand}</p>}
        <StarRating rating={b.rating} count={b.rating_count} />
      </div>
    </motion.button>
  );
}

export default function BaitCatalogPage() {
  const { t, i18n } = useTranslation();
  const { canAccess, requiredTier } = useEntitlement();
  const hasAccess = canAccess('bait_intelligence');
  const [currentUser, setCurrentUser] = React.useState(null);
  const { track } = useAnalytics(currentUser?.email);
  React.useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const isDE = i18n.language === 'de';

  const TABS = [
    { key: 'artificial', label: isDE ? 'Kunstköder' : 'Lures', emoji: '🪝' },
    { key: 'natural',    label: isDE ? 'Naturköder' : 'Natural', emoji: '🐟' },
    { key: 'live',       label: isDE ? 'Lebendköder' : 'Live Bait', emoji: '🐠' },
  ];

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
      {!hasAccess && (
        <PaywallModal open={true} onClose={() => window.history.back()} featureKey="bait_intelligence" requiredTier={requiredTier('bait_intelligence')} />
      )}
      {hasAccess && (<>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div>
          <p className="text-foam/50 text-sm">{t('bait.catalog_subtitle')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('bait.catalog_title')}</h1>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2">
          {TABS.map(tabCfg => (
            <button key={tabCfg.key} onClick={() => { setTab(tabCfg.key); setFilterBrand('all'); setSearch(''); }}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${tab === tabCfg.key ? 'gradient-tide text-white glow-tide' : 'glass-card text-foam/60'}`}>
              <span>{tabCfg.emoji}</span>
              <span className="text-xs">{tabCfg.label}</span>
            </button>
          ))}
        </div>

        {/* ── Natural bait info banner ── */}
        {tab === 'natural' && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 flex gap-3"
            style={{ background: 'rgba(14,189,216,0.08)', border: '1px solid rgba(14,189,216,0.25)' }}>
            <Info className="w-5 h-5 text-tide-400 flex-shrink-0 mt-0.5" />
            <p className="text-foam/70 text-xs leading-relaxed">
              {isDE
                ? 'Naturköder sind natürliche Nahrungsquellen, die Raubfische durch Geruch, Geschmack und Konsistenz anlocken. Sie können frisch oder gefroren präsentiert werden und eignen sich besonders beim Ansitzangeln (Grund- oder Posenmontage). Typische Beispiele: Köderfische (ganz), Fischfetzen, Würmer, Garnelen, Krebse.'
                : 'Natural baits attract predatory fish through scent, taste and texture. They can be presented fresh or frozen and are especially effective for bottom fishing and float fishing. Common examples: whole baitfish, fish strips, worms, shrimp, crabs.'}
            </p>
          </motion.div>
        )}

        {/* ── Live bait legal warning ── */}
        {tab === 'live' && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 flex gap-3"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.35)' }}>
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-amber-300 font-bold text-xs">
                {isDE ? '⚠️ Rechtlicher Hinweis' : '⚠️ Legal Notice'}
              </p>
              <p className="text-foam/70 text-xs leading-relaxed">
                {isDE
                  ? 'Das Angeln mit lebendem Köderfisch ist in Deutschland laut Tierschutzgesetz (§17 TierSchG) verboten und strafbar. Diese Informationen gelten für Länder, in denen Live Bait erlaubt ist (z.B. Mittelmeer-Angeln).'
                  : 'Live bait fishing is prohibited in Germany under animal protection law (§17 TierSchG). This information applies to countries where live bait is permitted (e.g. Mediterranean fishing).'}
              </p>
              <p className="text-foam/50 text-xs leading-relaxed">
                {isDE
                  ? 'Lebendköder reizen Raubfische durch natürliche Bewegung und Vibrationen. Die Handhabung ist aufwendig (Hälterung, Sauerstoff) und der Köder muss oft gewechselt werden.'
                  : 'Live bait attracts predatory fish through natural movement and vibrations. Handling requires effort (live-well, oxygen) and baits need frequent replacement.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Search + Brand filter */}
        <div className="flex gap-2">
          <div className="flex-1 glass-card rounded-2xl flex items-center gap-3 px-3 py-2.5">
            <Search className="w-4 h-4 text-tide-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('bait.search_placeholder')}
              className="bg-transparent flex-1 text-foam placeholder-foam/30 text-xs outline-none" />
          </div>
          {brands.length > 0 && (
            <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-abyss-700 text-foam/70 border border-tide-300/15 flex-shrink-0">
              <option value="all">{t('bait.all_brands')}</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          )}
        </div>

        {/* Bait grid */}
        {filtered.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center mt-8">
            <div className="text-5xl mb-4">{tab === 'artificial' ? '🪝' : tab === 'natural' ? '🐟' : '🐠'}</div>
            <p className="font-display font-bold text-foam text-lg">{t('bait.empty_title')}</p>
            <p className="text-foam/40 text-sm mt-2">{t('bait.empty_desc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((b, i) => {
              const handleClick = () => { setSelected(b); track('bait_recommendation_tap', { bait_name: b.name_de || b.name, category: b.category }); };
              if (tab === 'artificial') return <ArtificialCard key={b.id} b={b} onClick={handleClick} />;
              if (tab === 'natural')   return <IconCard key={b.id} b={b} onClick={handleClick} color="#0EBDD8" />;
              return <IconCard key={b.id} b={b} onClick={handleClick} color="#F59E0B" />;
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <DetailSheet bait={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
      </>)}
    </PageTransition>
  );
}