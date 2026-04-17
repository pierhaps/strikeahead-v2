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

// Emoji icons for natural/live baits by keyword
const BAIT_ICONS = {
  sardine: '🐟', sardin: '🐟',
  shrimp: '🦐', garnele: '🦐', krill: '🦐',
  squid: '🦑', tintenfisch: '🦑', kalmar: '🦑',
  mussel: '🦪', muschel: '🦪',
  crab: '🦀', krabbe: '🦀', krebs: '🦀',
  worm: '🪱', wurm: '🪱', regenwurm: '🪱',
  anchovy: '🐠', sardelle: '🐠',
  mackerel: '🐡', makrele: '🐡',
  eel: '🐍', aal: '🐍',
  herring: '🐟', hering: '🐟',
};

function getBaitIcon(name = '') {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(BAIT_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '🪱';
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
            <div className="w-20 h-20 rounded-2xl bg-abyss-700 flex items-center justify-center text-4xl flex-shrink-0">
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

// Info banner for natural baits
function NaturalBaitBanner({ lang }) {
  const text = lang === 'de'
    ? 'Naturköder sind natürliche Nahrungsquellen, die Raubfische durch Geruch, Geschmack und Konsistenz anlocken. Sie können frisch oder gefroren präsentiert werden und eignen sich besonders beim Ansitzangeln (Grund- oder Posenmontage). Typische Naturköder: Köderfische (ganz), Fischfetzen, Würmer, Garnelen, Krebse.'
    : 'Natural baits attract predatory fish through scent, taste and texture. They can be presented fresh or frozen and are especially effective for bottom fishing and float fishing. Typical natural baits: whole baitfish, fish strips, worms, shrimp, crabs.';
  return (
    <div className="rounded-2xl p-4 flex gap-3" style={{ background: 'rgba(45,168,255,0.08)', border: '1px solid rgba(45,168,255,0.25)' }}>
      <Info className="w-5 h-5 text-cyan2 flex-shrink-0 mt-0.5" />
      <p className="text-foam/70 text-xs leading-relaxed">{text}</p>
    </div>
  );
}

// Warning banner for live baits
function LiveBaitBanner({ lang }) {
  const text = lang === 'de'
    ? '⚠️ Rechtlicher Hinweis: Das Angeln mit lebendem Köderfisch ist in Deutschland laut Tierschutzgesetz (§17 TierSchG) verboten und strafbar. Diese Informationen gelten für Länder, in denen Live Bait erlaubt ist (z.B. Mittelmeer-Angeln).'
    : '⚠️ Legal Notice: Live bait fishing is prohibited in Germany under animal protection law (§17 TierSchG). This information applies to countries where live bait is permitted (e.g. Mediterranean fishing).';
  const desc = lang === 'de'
    ? 'Lebendköder reizen Raubfische durch natürliche Bewegung und Vibrationen. Die Handhabung ist aufwendig (Hälterung, Sauerstoff) und der Köder muss oft gewechselt werden.'
    : 'Live bait stimulates predatory fish through natural movement and vibrations. Handling requires effort (live wells, oxygen) and baits need frequent replacement.';
  return (
    <div className="space-y-2">
      <div className="rounded-2xl p-4 flex gap-3" style={{ background: 'rgba(255,165,0,0.08)', border: '1px solid rgba(255,165,0,0.35)' }}>
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-amber-200/80 text-xs leading-relaxed font-medium">{text}</p>
      </div>
      <div className="rounded-2xl p-4 flex gap-3" style={{ background: 'rgba(45,168,255,0.06)', border: '1px solid rgba(45,168,255,0.15)' }}>
        <Info className="w-4 h-4 text-cyan2/60 flex-shrink-0 mt-0.5" />
        <p className="text-foam/60 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// Card for artificial baits — with image
function ArtificialBaitCard({ bait, onClick }) {
  return (
    <motion.button onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.97 }}
      className="glass-card rounded-2xl overflow-hidden text-left w-full">
      <div className="h-28 bg-abyss-800 relative">
        {bait.image_url
          ? <img src={bait.image_url} alt={bait.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">🪝</div>
        }
      </div>
      <div className="p-2.5 space-y-1">
        <p className="font-bold text-foam text-xs leading-tight line-clamp-2">{bait.name_de || bait.name}</p>
        {bait.brand && <p className="text-foam/40 text-[10px]">{bait.brand}</p>}
        <StarRating rating={bait.rating} count={bait.rating_count} />
        {bait.price_eur && <p className="font-display font-bold text-sun-400 text-sm">{bait.price_eur} €</p>}
      </div>
    </motion.button>
  );
}

// Card for natural/live baits — icon-based, no image
function NaturalBaitCard({ bait, onClick }) {
  const icon = getBaitIcon(bait.name_de || bait.name);
  return (
    <motion.button onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.97 }}
      className="glass-card rounded-2xl overflow-hidden text-left w-full">
      <div className="h-28 bg-abyss-800 flex items-center justify-center text-5xl">
        {icon}
      </div>
      <div className="p-2.5 space-y-1">
        <p className="font-bold text-foam text-xs leading-tight line-clamp-2">{bait.name_de || bait.name}</p>
        {bait.brand && <p className="text-foam/40 text-[10px]">{bait.brand}</p>}
        <StarRating rating={bait.rating} count={bait.rating_count} />
        {bait.price_eur && <p className="font-display font-bold text-sun-400 text-sm">{bait.price_eur} €</p>}
      </div>
    </motion.button>
  );
}

export default function BaitCatalogPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'de';
  const { canAccess, requiredTier } = useEntitlement();
  const hasAccess = canAccess('bait_intelligence');
  const [currentUser, setCurrentUser] = React.useState(null);
  const { track } = useAnalytics(currentUser?.email);
  React.useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const TABS = [
    { key: 'artificial', label: t('bait.artificial', { defaultValue: 'Kunstköder' }) },
    { key: 'natural',    label: t('bait.natural',    { defaultValue: 'Naturköder' }) },
    { key: 'live',       label: t('bait.live',       { defaultValue: 'Lebendköder' }) },
  ];

  const [baits, setBaits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('artificial');
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.BaitCatalog.list('name', 500).then(d => { setBaits(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const byCategory = baits.filter(b => b.category === activeTab);
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
      {hasAccess && (
        <div className="px-4 pt-6 pb-4 space-y-4">
          <div>
            <p className="text-foam/50 text-sm">{t('bait.catalog_subtitle')}</p>
            <h1 className="font-display text-2xl font-extrabold text-foam">{t('bait.catalog_title')}</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setFilterBrand('all'); setSearch(''); }}
                className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.key ? 'gradient-tide text-white glow-tide' : 'glass-card text-foam/60'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category-specific info banners */}
          {activeTab === 'natural' && <NaturalBaitBanner lang={lang} />}
          {activeTab === 'live' && <LiveBaitBanner lang={lang} />}

          {/* Search + brand filter */}
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

          {filtered.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 text-center mt-8">
              <div className="text-5xl mb-4">🪝</div>
              <p className="font-display font-bold text-foam text-lg">{t('bait.empty_title')}</p>
              <p className="text-foam/40 text-sm mt-2">{t('bait.empty_desc')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((b, i) => {
                const handleTap = () => {
                  setSelected(b);
                  track('bait_recommendation_tap', { bait_name: b.name_de || b.name, category: b.category });
                };
                return activeTab === 'artificial'
                  ? <ArtificialBaitCard key={b.id} bait={b} onClick={handleTap} />
                  : <NaturalBaitCard key={b.id} bait={b} onClick={handleTap} />;
              })}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {selected && <DetailSheet bait={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </PageTransition>
  );
}