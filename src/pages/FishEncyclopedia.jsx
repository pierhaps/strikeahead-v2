import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, Thermometer, Anchor, Clock, Fish, BookOpen, ArrowUp, Shield, AlertTriangle } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';
import { SkeletonFishCard, FadeIn } from '@/components/shared/Skeleton';
import { fetchWithCache } from '@/hooks/useOfflineCache';

const tideEase = [0.2, 0.8, 0.2, 1];

/** Build image URL: GitHub raw first, Base44 CDN fallback */
const FISH_IMG_BASE = 'https://raw.githubusercontent.com/pierhaps/strikeahead-v2/main/public/fish';
function fishImageUrl(fish) {
  if (!fish.name_de) {
    return (fish.image_url && fish.image_url.includes('media.base44.com')) ? fish.image_url : null;
  }
  const slug = fish.name_de
    .split(/\s*[\/(]\s*/)[0].trim()
    .toLowerCase()
    .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${FISH_IMG_BASE}/${slug}.webp`;
}

const RARITY_CFG = {
  common:    { label: 'encyclopedia.rarity.common',    color: '#4DC3D1', bg: 'rgba(77,195,209,0.15)',  ring: 'border-tide-400/30' },
  uncommon:  { label: 'encyclopedia.rarity.uncommon',   color: '#7FDCE5', bg: 'rgba(127,220,229,0.12)', ring: 'border-cyan-400/30' },
  rare:      { label: 'encyclopedia.rarity.rare',       color: '#F5C34B', bg: 'rgba(245,195,75,0.15)',  ring: 'border-sun-400/40' },
  epic:      { label: 'encyclopedia.rarity.epic',       color: '#FF6B5B', bg: 'rgba(255,107,91,0.15)',  ring: 'border-red-400/40' },
  legendary: { label: 'encyclopedia.rarity.legendary',  color: '#FFD872', bg: 'rgba(255,216,114,0.20)', ring: 'border-amber-400/50' },
};

const DETAIL_TABS = [
  { key: 'encyclopedia.tabs.overview',        icon: '📊' },
  { key: 'encyclopedia.tabs.identification',  icon: '🔍' },
  { key: 'encyclopedia.tabs.technique',       icon: '🎣' },
  { key: 'encyclopedia.tabs.equipment',       icon: '🛠️' },
  { key: 'encyclopedia.tabs.cuisine',         icon: '🍽️' },
];

function DetailView({ fish, onClose }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const scrollRef = useRef(null);
  const rc = RARITY_CFG[fish.rarity] || RARITY_CFG.common;

  const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      ref={scrollRef}
      className="fixed inset-0 z-50 flex flex-col bg-abyss-950 overflow-y-auto">
      {/* Hero image */}
      <div className="relative h-60 flex-shrink-0">
        {fishImageUrl(fish)
          ? <img src={fishImageUrl(fish)} alt={fish.name_de} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-tide-500/30 to-abyss-900" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-abyss-950 via-abyss-950/20 to-transparent" />
        <motion.button onClick={onClose} whileTap={{ scale: 0.9 }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full liquid-glass flex items-center justify-center">
          <X className="w-4 h-4 text-foam" />
        </motion.button>
        <div className="absolute bottom-4 left-4 right-14">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold"
              style={{ background: rc.bg, color: rc.color }}>{t(rc.label)}</span>
            {fish.fish_family && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-foam/5 text-foam/40">{fish.fish_family}</span>
            )}
            {fish.invasive_category && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-500/15 text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />{fish.invasive_category === 'deadly_toxic' ? 'GIFTIG' : 'INVASIV'}
              </span>
            )}
          </div>
          <h2 className="font-display font-extrabold text-foam text-2xl leading-tight">{fish.name_de}</h2>
          <p className="text-foam/40 italic text-sm">{fish.name_latin || fish.name_en}</p>
        </div>
      </div>

      {/* Quick stats bar */}
      {(fish.max_length_cm || fish.record_weight_kg || fish.difficulty_rating) && (
        <div className="flex justify-around py-3 mx-4 mb-1 liquid-glass-subtle rounded-2xl -mt-5 relative z-10">
          {fish.max_length_cm && (
            <div className="text-center">
              <p className="font-display font-extrabold text-foam text-base">{fish.max_length_cm}<span className="text-xs text-foam/40"> cm</span></p>
              <p className="text-foam/30 text-[10px] uppercase tracking-wider">{t('encyclopedia.labels.max_length')}</p>
            </div>
          )}
          {fish.record_weight_kg && (
            <div className="text-center">
              <p className="font-display font-extrabold text-foam text-base">{fish.record_weight_kg}<span className="text-xs text-foam/40"> kg</span></p>
              <p className="text-foam/30 text-[10px] uppercase tracking-wider">Rekord</p>
            </div>
          )}
          {fish.difficulty_rating && (
            <div className="text-center">
              <p className="font-display font-extrabold text-tide-300 text-base">{fish.difficulty_rating}<span className="text-xs text-foam/40">/10</span></p>
              <p className="text-foam/30 text-[10px] uppercase tracking-wider">{t('encyclopedia.labels.difficulty')}</p>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 overflow-x-auto scrollbar-hide px-4 py-3 border-b border-foam/5">
        {DETAIL_TABS.map((tabCfg, i) => (
          <motion.button key={tabCfg.key} onClick={() => setTab(i)}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-2 text-xs font-semibold flex-shrink-0 rounded-xl transition-all flex items-center gap-1.5 ${
              tab === i ? 'bg-gradient-to-r from-tide-500 to-tide-400 text-white shadow-lg shadow-tide-500/20' : 'text-foam/40'
            }`}>
            <span className="text-sm">{tabCfg.icon}</span>
            {t(tabCfg.key)}
          </motion.button>
        ))}
      </div>

      {/* Tab content with animation */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2, ease: tideEase }}
          className="p-4 space-y-3">

          {tab === 0 && (
            <>
              {fish.description_de && <p className="text-foam/70 text-sm leading-relaxed">{fish.description_de}</p>}
              <div className="grid grid-cols-2 gap-2">
                {fish.depth_min_m != null && (
                  <div className="liquid-glass-subtle rounded-xl p-3">
                    <p className="text-foam/40 text-xs">{t('encyclopedia.labels.depth')}</p>
                    <p className="text-foam font-bold text-sm">{fish.depth_min_m}–{fish.depth_max_m ?? '?'} m</p>
                  </div>
                )}
                {fish.water_temp_min_c != null && (
                  <div className="liquid-glass-subtle rounded-xl p-3">
                    <p className="text-foam/40 text-xs">{t('encyclopedia.labels.water_temp')}</p>
                    <p className="text-foam font-bold text-sm">{fish.water_temp_min_c}–{fish.water_temp_max_c ?? '?'}°C</p>
                  </div>
                )}
                {fish.minimum_size_cm && (
                  <div className="liquid-glass-subtle rounded-xl p-3 border border-sun-400/20">
                    <p className="text-sun-400/70 text-xs">{t('encyclopedia.labels.min_size')}</p>
                    <p className="text-sun-400 font-bold text-sm">{fish.minimum_size_cm} cm</p>
                    {fish.minimum_size_source && <p className="text-foam/25 text-[9px] mt-0.5">{fish.minimum_size_source}</p>}
                  </div>
                )}
                {fish.equipment_class && (
                  <div className="liquid-glass-subtle rounded-xl p-3">
                    <p className="text-foam/40 text-xs">{t('encyclopedia.labels.equipment_class')}</p>
                    <p className="text-foam font-bold text-sm capitalize">{fish.equipment_class}</p>
                  </div>
                )}
              </div>
              {fish.best_months?.length > 0 && (
                <div className="liquid-glass-subtle rounded-xl p-4">
                  <p className="text-foam/40 text-xs mb-2">{t('encyclopedia.labels.best_months')}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <span key={m} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all ${
                        fish.best_months.includes(m)
                          ? 'bg-gradient-to-r from-tide-500 to-tide-400 text-white shadow-sm shadow-tide-500/20'
                          : 'bg-foam/5 text-foam/25'
                      }`}>{t(`months_short.${m}`)}</span>
                    ))}
                  </div>
                </div>
              )}
              {fish.best_time_of_day?.length > 0 && (
                <div className="liquid-glass-subtle rounded-xl p-4">
                  <p className="text-foam/40 text-xs mb-2">{t('encyclopedia.labels.best_daytime')}</p>
                  <div className="flex flex-wrap gap-2">
                    {fish.best_time_of_day.map(tod => (
                      <span key={tod} className="px-2.5 py-1 bg-tide-500/10 text-tide-300 rounded-xl text-xs font-medium">{tod}</span>
                    ))}
                  </div>
                </div>
              )}
              {fish.protection_status && (
                <div className={`liquid-glass-subtle rounded-xl p-3 flex items-center justify-between ${
                  fish.is_protected ? 'border border-red-500/20' : ''
                }`}>
                  <span className="text-foam/50 text-xs flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />{t('encyclopedia.labels.protection_status')}
                  </span>
                  <span className={`text-xs font-semibold ${fish.is_protected ? 'text-red-400' : 'text-foam'}`}>
                    {fish.protection_status}
                  </span>
                </div>
              )}
              {fish.fun_facts_de?.length > 0 && (
                <div className="liquid-glass-subtle rounded-xl p-4">
                  <p className="text-foam/40 text-xs mb-2">{t('encyclopedia.labels.fun_facts')}</p>
                  {fish.fun_facts_de.map((fact, fi) => (
                    <p key={fi} className="text-foam/60 text-xs mb-1.5 pl-3 border-l-2 border-tide-400/30">{fact}</p>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 1 && (
            <>
              {fish.identification_tips_de && <p className="text-foam/70 text-sm leading-relaxed">{fish.identification_tips_de}</p>}
              {fish.male_female_differences_de && (
                <div className="liquid-glass-subtle rounded-xl p-4">
                  <p className="text-foam/40 text-xs mb-1">{t('encyclopedia.labels.sex_differences')}</p>
                  <p className="text-foam/60 text-sm">{fish.male_female_differences_de}</p>
                </div>
              )}
              {fish.danger_notes_de && (
                <div className="liquid-glass-subtle rounded-xl p-4 border border-red-500/25">
                  <p className="text-red-400 text-xs font-bold mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />{t('encyclopedia.labels.warning')}
                  </p>
                  <p className="text-foam/60 text-sm">{fish.danger_notes_de}</p>
                </div>
              )}
              {fish.habitat?.length > 0 && (
                <div className="liquid-glass-subtle rounded-xl p-4">
                  <p className="text-foam/40 text-xs mb-2">Lebensraum</p>
                  <div className="flex flex-wrap gap-2">
                    {fish.habitat.map(hab => (
                      <span key={hab} className="px-2.5 py-1 bg-tide-500/10 text-tide-300 rounded-xl text-xs font-medium">{hab}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 2 && (
            <>
              {fish.recommended_technique?.length > 0 && (
                <div className="liquid-glass-subtle rounded-xl p-4">
                  <p className="text-foam/40 text-xs mb-2">{t('encyclopedia.labels.techniques')}</p>
                  {fish.recommended_technique.map(tech => (
                    <p key={tech} className="text-foam font-semibold text-sm mb-1.5 pl-3 border-l-2 border-tide-400/40">
                      {tech}
                    </p>
                  ))}
                </div>
              )}
              {fish.recommended_lure?.length > 0 && (
                <div className="liquid-glass-subtle rounded-xl p-4">
                  <p className="text-foam/40 text-xs mb-2">{t('encyclopedia.labels.bait')}</p>
                  <div className="flex flex-wrap gap-2">
                    {fish.recommended_lure.map(lure => (
                      <span key={lure} className="px-2.5 py-1.5 bg-sun-500/10 text-sun-300 rounded-xl text-xs font-medium">{lure}</span>
                    ))}
                  </div>
                </div>
              )}
              {fish.preferred_structure && (
                <div className="liquid-glass-subtle rounded-xl p-3">
                  <p className="text-foam/40 text-xs mb-1">{t('encyclopedia.labels.preferred_structure')}</p>
                  <p className="text-foam/70 text-sm">{fish.preferred_structure}</p>
                </div>
              )}
              {fish.current_preference && (
                <div className="liquid-glass-subtle rounded-xl p-3">
                  <p className="text-foam/40 text-xs mb-1">{t('encyclopedia.labels.current')}</p>
                  <p className="text-foam/70 text-sm">{fish.current_preference}</p>
                </div>
              )}
              {fish.tide_preference && (
                <div className="liquid-glass-subtle rounded-xl p-3">
                  <p className="text-foam/40 text-xs mb-1">{t('encyclopedia.labels.tide')}</p>
                  <p className="text-foam/70 text-sm">{fish.tide_preference}</p>
                </div>
              )}
              {fish.barometric_preference && (
                <div className="liquid-glass-subtle rounded-xl p-3">
                  <p className="text-foam/40 text-xs mb-1">{t('encyclopedia.labels.barometer')}</p>
                  <p className="text-foam/70 text-sm">{fish.barometric_preference}</p>
                </div>
              )}
              {fish.fight_characteristics_de && (
                <div className="liquid-glass-subtle rounded-xl p-4">
                  <p className="text-foam/40 text-xs mb-1">{t('encyclopedia.labels.fight_behavior')}</p>
                  <p className="text-foam/60 text-sm">{fish.fight_characteristics_de}</p>
                </div>
              )}
            </>
          )}

          {tab === 3 && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {fish.equipment_class && (
                  <div className="liquid-glass-subtle rounded-xl p-3">
                    <p className="text-foam/40 text-xs">{t('encyclopedia.labels.equipment_class')}</p>
                    <p className="text-foam font-bold text-sm capitalize">{fish.equipment_class}</p>
                  </div>
                )}
                {fish.difficulty_rating && (
                  <div className="liquid-glass-subtle rounded-xl p-3">
                    <p className="text-foam/40 text-xs">{t('encyclopedia.labels.difficulty')}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <p className="text-tide-300 font-bold text-sm">{fish.difficulty_rating}/10</p>
                      <div className="flex-1 h-1.5 bg-foam/5 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full bg-gradient-to-r from-green-400 via-sun-400 to-red-400"
                          initial={{ width: 0 }} animate={{ width: `${fish.difficulty_rating * 10}%` }}
                          transition={{ duration: 0.8, ease: tideEase }} />
                      </div>
                    </div>
                  </div>
                )}
                {fish.line_strength_min_kg && (
                  <div className="liquid-glass-subtle rounded-xl p-3">
                    <p className="text-foam/40 text-xs">{t('encyclopedia.labels.line_strength')}</p>
                    <p className="text-foam font-bold text-sm">{fish.line_strength_min_kg}–{fish.line_strength_max_kg} kg</p>
                  </div>
                )}
                {fish.hook_size && (
                  <div className="liquid-glass-subtle rounded-xl p-3">
                    <p className="text-foam/40 text-xs">{t('encyclopedia.labels.hook_size')}</p>
                    <p className="text-foam font-bold text-sm">{fish.hook_size}</p>
                  </div>
                )}
              </div>
              {fish.leader_type && (
                <div className="liquid-glass-subtle rounded-xl p-3">
                  <p className="text-foam/40 text-xs mb-1">{t('encyclopedia.labels.leader')}</p>
                  <p className="text-foam/70 text-sm">{fish.leader_type}</p>
                </div>
              )}
              {fish.knot_recommendation && (
                <div className="liquid-glass-subtle rounded-xl p-3">
                  <p className="text-foam/40 text-xs mb-1">{t('encyclopedia.labels.knot')}</p>
                  <p className="text-foam/70 text-sm">{fish.knot_recommendation}</p>
                </div>
              )}
            </>
          )}

          {tab === 4 && (
            <>
              <div className="flex items-center gap-3 liquid-glass-subtle rounded-xl p-4">
                <div className="w-12 h-12 rounded-xl bg-sun-500/10 flex items-center justify-center text-2xl">🍽️</div>
                <div>
                  <p className="text-foam/40 text-xs">{t('encyclopedia.labels.edibility')}</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <motion.span key={si}
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ delay: si * 0.1, type: 'spring', stiffness: 400 }}
                        className={`text-base ${si < (fish.edibility_rating || 0) ? 'text-sun-400' : 'text-foam/15'}`}>★</motion.span>
                    ))}
                  </div>
                </div>
              </div>
              {fish.culinary_tips_de && <p className="text-foam/60 text-sm leading-relaxed">{fish.culinary_tips_de}</p>}
              {(fish.min_size_cm || fish.minimum_size_cm) && (
                <div className="liquid-glass-subtle rounded-xl p-3 flex justify-between border border-sun-400/15">
                  <span className="text-foam/50 text-xs">{t('encyclopedia.labels.min_size')}</span>
                  <span className="text-sun-400 font-bold text-sm">{fish.minimum_size_cm || fish.min_size_cm} cm</span>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Back to top */}
      <motion.button onClick={scrollToTop}
        initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
        whileHover={{ opacity: 1 }} whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-4 z-50 w-10 h-10 rounded-full liquid-glass flex items-center justify-center shadow-lg">
        <ArrowUp className="w-4 h-4 text-foam" />
      </motion.button>

      <div className="h-8" />
    </motion.div>
  );
}

export default function FishEncyclopediaPage() {
  const { t } = useTranslation();
  const [fish, setFish] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filterHabitat, setFilterHabitat] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterInvasive, setFilterInvasive] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchWithCache('fish_encyclopedia', () => base44.entities.FishEncyclopedia.list('name_de', 500))
      .then(d => { setFish(d || []); setLoading(false); });
  }, []);

  const filtered = useMemo(() => fish.filter(f => {
    const q = query.toLowerCase();
    if (q && !(f.name_de || '').toLowerCase().includes(q) && !(f.name_en || '').toLowerCase().includes(q) && !(f.name_latin || '').toLowerCase().includes(q)) return false;
    if (filterHabitat !== 'all' && !(f.habitat || []).includes(filterHabitat)) return false;
    if (filterRarity !== 'all' && f.rarity !== filterRarity) return false;
    if (filterInvasive === 'invasive' && !f.invasive_category) return false;
    if (filterInvasive === 'safe' && f.invasive_category) return false;
    if (filterInvasive !== 'all' && filterInvasive !== 'invasive' && filterInvasive !== 'safe' && f.invasive_category !== filterInvasive) return false;
    return true;
  }), [fish, query, filterHabitat, filterRarity, filterInvasive]);

  const habitats = useMemo(() => [...new Set(fish.flatMap(f => f.habitat || []))].sort(), [fish]);

  const stats = useMemo(() => ({
    total: fish.length,
    predators: fish.filter(f => !f.invasive_category).length,
    invasive: fish.filter(f => f.invasive_category).length,
  }), [fish]);

  if (loading) return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-3">
        <FadeIn className="space-y-3">
          {[0,1,2,3,4,5,6,7].map(i => <SkeletonFishCard key={i} />)}
        </FadeIn>
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: tideEase }}
          className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tide-500/30 to-tide-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-tide-300" />
            </div>
            <div>
              <h1 className="font-display text-xl font-extrabold text-foam">{t('encyclopedia.title')}</h1>
              <p className="text-foam/40 text-xs">{stats.total} {t('encyclopedia.species_count')} · {stats.invasive} {t('encyclopedia.invasive_label')}</p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, ease: tideEase }}
          className="liquid-glass rounded-2xl flex items-center gap-3 px-4 py-3">
          <Search className="w-4 h-4 text-tide-400 flex-shrink-0" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder={t('encyclopedia.search_placeholder')}
            className="bg-transparent flex-1 text-foam placeholder-foam/30 text-sm outline-none" />
          {query && (
            <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setQuery('')}>
              <X className="w-4 h-4 text-foam/30" />
            </motion.button>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease: tideEase }}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <select value={filterHabitat} onChange={e => setFilterHabitat(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs liquid-glass-subtle text-foam/70 border border-foam/10 flex-shrink-0 bg-transparent">
            <option value="all">{t('encyclopedia.filter_habitat_all')}</option>
            {habitats.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          {['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'].map(r => (
            <motion.button key={r} onClick={() => setFilterRarity(r)}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                filterRarity === r
                  ? 'bg-gradient-to-r from-tide-500 to-tide-400 text-white shadow-lg shadow-tide-500/20'
                  : 'liquid-glass-subtle text-foam/50'
              }`}>
              {r === 'all' ? t('common.all') : t(RARITY_CFG[r]?.label || r)}
            </motion.button>
          ))}
        </motion.div>

        {/* Invasive filter */}
        {stats.invasive > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, ease: tideEase }}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {[
              { key: 'all',               label: t('common.all'),                              icon: null },
              { key: 'invasive',          label: t('encyclopedia.invasive_label'),              icon: '⚠️' },
              { key: 'deadly_toxic',      label: t('encyclopedia.invasive.deadly_toxic'),       icon: '☠️' },
              { key: 'venomous_invasive', label: t('encyclopedia.invasive.venomous_invasive'),  icon: '🐡' },
              { key: 'invasive_herbivore',label: t('encyclopedia.invasive.invasive_herbivore'), icon: '🌿' },
              { key: 'venomous_native',   label: t('encyclopedia.invasive.venomous_native'),    icon: '🔶' },
              { key: 'safe',             label: t('encyclopedia.safe_label'),                  icon: '✅' },
            ].map(chip => {
              const isActive = filterInvasive === chip.key;
              const isDanger = chip.key !== 'all' && chip.key !== 'safe';
              return (
                <motion.button key={chip.key} onClick={() => setFilterInvasive(chip.key)}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all flex items-center gap-1 ${
                    isActive
                      ? isDanger
                        ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-600/30'
                        : 'bg-gradient-to-r from-tide-500 to-tide-400 text-white shadow-lg shadow-tide-500/20'
                      : 'liquid-glass-subtle text-foam/50'
                  }`}>
                  {chip.icon && <span>{chip.icon}</span>}
                  {chip.label}
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Results count */}
        <p className="text-foam/25 text-xs">{filtered.length} {t('encyclopedia.results')}</p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="liquid-glass rounded-3xl p-10 text-center mt-4">
            <Fish className="w-10 h-10 mx-auto mb-3 text-foam/15" />
            <p className="font-display font-bold text-foam text-lg">{t('encyclopedia.empty_title')}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((f, i) => {
              const rc = RARITY_CFG[f.rarity] || RARITY_CFG.common;
              return (
                <motion.button key={f.id} onClick={() => setSelected(f)}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03, ease: tideEase }}
                  whileTap={{ scale: 0.97 }}
                  className={`liquid-glass-subtle rounded-2xl overflow-hidden text-left border ${rc.ring}`}>
                  <div className="h-28 relative bg-abyss-800">
                    {fishImageUrl(f)
                      ? <img src={fishImageUrl(f)} alt={f.name_de} className="w-full h-full object-cover" loading="lazy" />
                      : <div className="w-full h-full flex items-center justify-center"><Fish className="w-8 h-8 text-foam/10" /></div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-abyss-950/80 to-transparent" />
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                      style={{ background: rc.bg, color: rc.color }}>{t(rc.label)}</span>
                    {f.invasive_category && (
                      <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="font-display font-bold text-foam text-sm leading-tight truncate">{f.name_de}</p>
                    <p className="text-foam/25 italic text-[10px] truncate">{f.name_latin || f.name_en}</p>
                    {f.fish_family && <p className="text-tide-400/40 text-[9px] mt-0.5 truncate">{f.fish_family}</p>}
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