import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp, Plus, Zap, Users, Crown, Cpu, Rocket, Check,
  MessageCircle, Hammer, Sparkles, TrendingUp, Calendar,
  Wifi, Watch, Map, Camera, Fish, Shield, Globe
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/ui/PageTransition';

const tideEase = [0.2, 0.8, 0.2, 1];

const TAG_STYLES = {
  AI:        { bg: 'bg-purple-500/15', text: 'text-purple-300', icon: Cpu },
  Community: { bg: 'bg-sun-500/15',    text: 'text-sun-300',    icon: Users },
  'Pro':     { bg: 'bg-amber-500/15',  text: 'text-amber-300',  icon: Crown },
  Core:      { bg: 'bg-tide-500/15',   text: 'text-tide-300',   icon: Zap },
  New:       { bg: 'bg-green-500/15',  text: 'text-green-300',  icon: Sparkles },
  Safety:    { bg: 'bg-red-500/15',    text: 'text-red-300',    icon: Shield },
};

const COL_META = {
  building:   { icon: Hammer,        gradient: 'from-tide-500/20 to-tide-500/5',  dot: 'bg-tide-400',   label_icon: '🔨' },
  planned:    { icon: Calendar,       gradient: 'from-foam/10 to-foam/5',          dot: 'bg-foam/60',    label_icon: '📋' },
  discussion: { icon: MessageCircle,  gradient: 'from-purple-500/10 to-purple-500/5', dot: 'bg-purple-400', label_icon: '💬' },
  shipped:    { icon: Check,          gradient: 'from-green-500/15 to-green-500/5', dot: 'bg-green-400',  label_icon: '✅' },
};

const getColumns = (t) => [
  { key: 'shipped',    label: t('roadmap.columns.shipped') },
  { key: 'building',   label: t('roadmap.columns.building') },
  { key: 'planned',    label: t('roadmap.columns.planned') },
  { key: 'discussion', label: t('roadmap.columns.discussion') },
];

const getInitialItems = (t) => [
  // Shipped
  { id: 1,  col: 'shipped',    title: t('roadmap.items.hookpoints_title'),   desc: t('roadmap.items.hookpoints_desc'),   tags: ['Core'],            votes: 103, progress: 100, icon: Zap },
  { id: 2,  col: 'shipped',    title: t('roadmap.items.feed_title'),         desc: t('roadmap.items.feed_desc'),         tags: ['Community'],       votes: 78,  progress: 100, icon: Users },
  { id: 3,  col: 'shipped',    title: t('roadmap.items.solunar_title'),      desc: t('roadmap.items.solunar_desc'),      tags: ['Core', 'Pro'],     votes: 91,  progress: 100, icon: TrendingUp },
  { id: 14, col: 'shipped',    title: t('roadmap.items.i18n_title'),         desc: t('roadmap.items.i18n_desc'),         tags: ['Core'],            votes: 65,  progress: 100, icon: Globe },
  { id: 15, col: 'shipped',    title: t('roadmap.items.encyclopedia_title'), desc: t('roadmap.items.encyclopedia_desc'), tags: ['Core'],            votes: 88,  progress: 100, icon: Fish },
  { id: 16, col: 'shipped',    title: t('roadmap.items.bait_intel_title'),   desc: t('roadmap.items.bait_intel_desc'),   tags: ['AI', 'Pro'],       votes: 72,  progress: 100, icon: Sparkles },
  // Building
  { id: 4,  col: 'building',   title: t('roadmap.items.ai_v2_title'),       desc: t('roadmap.items.ai_v2_desc'),        tags: ['AI', 'Pro'],       votes: 42,  progress: 65,  icon: Cpu },
  { id: 5,  col: 'building',   title: t('roadmap.items.offline_title'),      desc: t('roadmap.items.offline_desc'),      tags: ['Core'],            votes: 87,  progress: 40,  icon: Wifi },
  { id: 17, col: 'building',   title: t('roadmap.items.map_v2_title'),      desc: t('roadmap.items.map_v2_desc'),       tags: ['Core', 'New'],     votes: 94,  progress: 75,  icon: Map },
  { id: 18, col: 'building',   title: t('roadmap.items.invasive_title'),     desc: t('roadmap.items.invasive_desc'),     tags: ['Community', 'Safety'], votes: 56, progress: 80, icon: Shield },
  // Planned
  { id: 6,  col: 'planned',    title: t('roadmap.items.chat_groups_title'),  desc: t('roadmap.items.chat_groups_desc'),  tags: ['Community'],       votes: 56,  progress: 0,   icon: MessageCircle },
  { id: 7,  col: 'planned',    title: t('roadmap.items.apple_watch_title'),  desc: t('roadmap.items.apple_watch_desc'),  tags: ['Core', 'Pro'],     votes: 34,  progress: 0,   icon: Watch },
  { id: 8,  col: 'planned',    title: t('roadmap.items.guided_tours_title'), desc: t('roadmap.items.guided_tours_desc'), tags: ['Community'],       votes: 28,  progress: 0,   icon: Map },
  // Discussion
  { id: 9,  col: 'discussion', title: t('roadmap.items.nft_title'),          desc: t('roadmap.items.nft_desc'),          tags: ['Community'],       votes: 12,  progress: 0,   icon: Sparkles },
  { id: 10, col: 'discussion', title: t('roadmap.items.ar_title'),           desc: t('roadmap.items.ar_desc'),           tags: ['AI'],              votes: 19,  progress: 0,   icon: Camera },
];

function ProgressRing({ progress, size = 32, stroke = 3 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  const color = progress === 100 ? '#4ade80' : progress > 50 ? '#0EBDD8' : '#2580C3';

  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: tideEase, delay: 0.3 }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
      {progress === 100 && (
        <motion.path
          d={`M${size*0.32} ${size*0.5} L${size*0.45} ${size*0.62} L${size*0.68} ${size*0.38}`}
          fill="none" stroke="#4ade80" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        />
      )}
      {progress > 0 && progress < 100 && (
        <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
          className="fill-foam/70" style={{ fontSize: size * 0.3, fontWeight: 700 }}>
          {progress}
        </text>
      )}
    </svg>
  );
}

function StatBadge({ count, label, color = 'tide' }) {
  return (
    <div className="flex flex-col items-center">
      <motion.span
        className={`font-display text-2xl font-extrabold text-${color}-400`}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
      >
        {count}
      </motion.span>
      <span className="text-foam/40 text-[10px] uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function Roadmap() {
  const { t } = useTranslation();
  const COLUMNS = useMemo(() => getColumns(t), [t]);
  const [items, setItems] = useState(() => getInitialItems(t));
  const [voted, setVoted] = useState(new Set());
  const [activeCol, setActiveCol] = useState('shipped');

  const handleVote = (id) => {
    if (voted.has(id)) return;
    setVoted(prev => new Set([...prev, id]));
    setItems(prev => prev.map(item => item.id === id ? { ...item, votes: item.votes + 1 } : item));
  };

  const handleSuggest = () => {
    const title = window.prompt(t('roadmap.prompt_title'));
    if (!title) return;
    const desc = window.prompt(t('roadmap.prompt_desc')) || '';
    setItems(prev => [...prev, { id: Date.now(), col: 'discussion', title, desc, tags: ['Community'], votes: 0, progress: 0, icon: Sparkles }]);
  };

  const activeItems = useMemo(() =>
    items.filter(item => item.col === activeCol).sort((a, b) => b.votes - a.votes),
    [items, activeCol]
  );

  const stats = useMemo(() => ({
    shipped:  items.filter(i => i.col === 'shipped').length,
    building: items.filter(i => i.col === 'building').length,
    planned:  items.filter(i => i.col === 'planned').length,
    total:    items.length,
  }), [items]);

  const meta = COL_META[activeCol];

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-8 space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: tideEase }}
          className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tide-500/30 to-tide-500/10 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-tide-300" />
            </div>
            <div>
              <h1 className="font-display text-xl font-extrabold text-foam">{t('roadmap.title')}</h1>
              <p className="text-foam/40 text-xs">{t('roadmap.subtitle')}</p>
            </div>
          </div>
          <motion.button onClick={handleSuggest} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-tide-500 to-tide-400 text-white text-xs font-bold shadow-lg shadow-tide-500/20">
            <Plus className="w-3.5 h-3.5" />{t('roadmap.suggest')}
          </motion.button>
        </motion.div>

        {/* Stats overview */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease: tideEase }}
          className="liquid-glass rounded-2xl p-4 flex justify-around">
          <StatBadge count={stats.shipped} label={t('roadmap.stats.shipped')} color="green" />
          <div className="w-px bg-foam/10" />
          <StatBadge count={stats.building} label={t('roadmap.stats.building')} color="tide" />
          <div className="w-px bg-foam/10" />
          <StatBadge count={stats.planned} label={t('roadmap.stats.planned')} color="foam" />
          <div className="w-px bg-foam/10" />
          <StatBadge count={stats.total} label={t('roadmap.stats.total')} color="sun" />
        </motion.div>

        {/* Column tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {COLUMNS.map((col, ci) => {
            const cm = COL_META[col.key];
            const count = items.filter(i => i.col === col.key).length;
            return (
              <motion.button key={col.key} onClick={() => setActiveCol(col.key)}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + ci * 0.05, ease: tideEase }}
                whileTap={{ scale: 0.96 }}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCol === col.key
                    ? 'bg-gradient-to-r from-tide-500 to-tide-400 text-white shadow-lg shadow-tide-500/20'
                    : 'liquid-glass-subtle text-foam/50'
                }`}>
                <span className={`w-2 h-2 rounded-full ${activeCol === col.key ? 'bg-white' : cm.dot}`} />
                {col.label}
                <span className={`ml-0.5 text-[10px] ${activeCol === col.key ? 'text-white/70' : 'text-foam/30'}`}>({count})</span>
              </motion.button>
            );
          })}
        </div>

        {/* Active column header bar */}
        <motion.div
          key={activeCol}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r ${meta.gradient}`}>
          <meta.icon className="w-4 h-4 text-foam/50" />
          <span className="text-foam/60 text-xs font-medium">
            {activeCol === 'shipped' && t('roadmap.col_desc.shipped')}
            {activeCol === 'building' && t('roadmap.col_desc.building')}
            {activeCol === 'planned' && t('roadmap.col_desc.planned')}
            {activeCol === 'discussion' && t('roadmap.col_desc.discussion')}
          </span>
        </motion.div>

        {/* Items */}
        <AnimatePresence mode="wait">
          <motion.div key={activeCol} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} className="space-y-3">
            {activeItems.map((item, i) => {
              const ItemIcon = item.icon || Zap;
              return (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, ease: tideEase }}
                  className="liquid-glass rounded-2xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {/* Progress ring */}
                    <ProgressRing progress={item.progress} />
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <ItemIcon className="w-3.5 h-3.5 text-tide-300 flex-shrink-0" />
                        <h3 className="text-foam font-bold text-sm truncate">{item.title}</h3>
                      </div>
                      <p className="text-foam/45 text-xs mt-1 line-clamp-2">{item.desc}</p>
                    </div>
                    {/* Vote button */}
                    <motion.button onClick={() => handleVote(item.id)} whileTap={{ scale: 0.9 }}
                      className={`flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl border transition-all flex-shrink-0 ${
                        voted.has(item.id)
                          ? 'border-sun-400/50 bg-sun-500/10 shadow-lg shadow-sun-500/10'
                          : 'border-foam/10 liquid-glass-subtle'
                      }`}>
                      <motion.div animate={voted.has(item.id) ? { y: [0, -3, 0] } : {}}
                        transition={{ duration: 0.3 }}>
                        <ChevronUp className={`w-4 h-4 ${voted.has(item.id) ? 'text-sun-400' : 'text-foam/40'}`} />
                      </motion.div>
                      <span className={`font-display font-bold text-xs ${voted.has(item.id) ? 'text-sun-400' : 'text-foam/50'}`}>
                        {item.votes}
                      </span>
                    </motion.button>
                  </div>

                  {/* Progress bar (for building items) */}
                  {item.progress > 0 && item.progress < 100 && (
                    <div className="h-1 rounded-full bg-foam/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-tide-500 to-tide-300"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 1, ease: tideEase, delay: 0.5 + i * 0.1 }}
                      />
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {item.tags.map(tag => {
                        const s = TAG_STYLES[tag] || TAG_STYLES.Core;
                        const Icon = s.icon;
                        return (
                          <span key={tag} className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium ${s.bg} ${s.text}`}>
                            <Icon className="w-3 h-3" />{tag}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })}
            {activeItems.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-16 text-foam/30 text-sm">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-foam/15" />
                {t('roadmap.empty')}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
