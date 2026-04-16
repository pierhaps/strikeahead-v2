import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, Plus, Zap, Users, Crown, Cpu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/ui/PageTransition';

const TAG_STYLES = {
  AI: { bg: 'bg-tide-500/15', text: 'text-tide-300', icon: Cpu },
  Community: { bg: 'bg-sun-500/15', text: 'text-sun-300', icon: Users },
  'Pro-only': { bg: 'bg-abyss-600/60', text: 'text-foam/60', icon: Crown },
  Core: { bg: 'bg-tide-500/10', text: 'text-tide-400', icon: Zap },
};

const getColumns = (t) => [
  { key: 'building', label: t('roadmap.columns.building'), color: 'border-tide-400/40' },
  { key: 'planned', label: t('roadmap.columns.planned'), color: 'border-foam/20' },
  { key: 'discussion', label: t('roadmap.columns.discussion'), color: 'border-foam/10' },
  { key: 'shipped', label: t('roadmap.columns.shipped'), color: 'border-green-400/30' },
];

const getInitialItems = (t) => [
  { id: 1, col: 'building', title: t('roadmap.items.ai_v2_title'), desc: t('roadmap.items.ai_v2_desc'), tags: ['AI', 'Pro-only'], votes: 42 },
  { id: 2, col: 'building', title: t('roadmap.items.offline_title'), desc: t('roadmap.items.offline_desc'), tags: ['Core'], votes: 87 },
  { id: 3, col: 'planned', title: t('roadmap.items.chat_groups_title'), desc: t('roadmap.items.chat_groups_desc'), tags: ['Community'], votes: 56 },
  { id: 4, col: 'planned', title: t('roadmap.items.apple_watch_title'), desc: t('roadmap.items.apple_watch_desc'), tags: ['Core', 'Pro-only'], votes: 34 },
  { id: 5, col: 'planned', title: t('roadmap.items.guided_tours_title'), desc: t('roadmap.items.guided_tours_desc'), tags: ['Community'], votes: 28 },
  { id: 6, col: 'discussion', title: t('roadmap.items.nft_title'), desc: t('roadmap.items.nft_desc'), tags: ['Community'], votes: 12 },
  { id: 7, col: 'discussion', title: t('roadmap.items.ar_title'), desc: t('roadmap.items.ar_desc'), tags: ['AI'], votes: 19 },
  { id: 8, col: 'shipped', title: t('roadmap.items.hookpoints_title'), desc: t('roadmap.items.hookpoints_desc'), tags: ['Core'], votes: 103 },
  { id: 9, col: 'shipped', title: t('roadmap.items.feed_title'), desc: t('roadmap.items.feed_desc'), tags: ['Community'], votes: 78 },
  { id: 10, col: 'shipped', title: t('roadmap.items.solunar_title'), desc: t('roadmap.items.solunar_desc'), tags: ['Core', 'Pro-only'], votes: 91 },
];

export default function Roadmap() {
  const { t } = useTranslation();
  const COLUMNS = React.useMemo(() => getColumns(t), [t]);
  const [items, setItems] = useState(() => getInitialItems(t));
  const [voted, setVoted] = useState(new Set());
  const [activeCol, setActiveCol] = useState('building');

  const handleVote = (id) => {
    if (voted.has(id)) return;
    setVoted(prev => new Set([...prev, id]));
    setItems(prev => prev.map(item => item.id === id ? { ...item, votes: item.votes + 1 } : item));
  };

  const handleSuggest = () => {
    const title = window.prompt(t('roadmap.prompt_title'));
    if (!title) return;
    const desc = window.prompt(t('roadmap.prompt_desc')) || '';
    setItems(prev => [...prev, { id: Date.now(), col: 'discussion', title, desc, tags: ['Community'], votes: 0 }]);
  };

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foam/50 text-sm">{t('roadmap.title')}</p>
            <h1 className="font-display text-2xl font-extrabold text-foam">{t('roadmap.title')}</h1>
          </div>
          <button onClick={handleSuggest}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl gradient-tide text-white text-sm font-semibold">
            <Plus className="w-4 h-4" />{t('roadmap.suggest')}
          </button>
        </div>

        {/* Mobile column tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {COLUMNS.map(col => (
            <button key={col.key} onClick={() => setActiveCol(col.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeCol === col.key ? 'gradient-tide text-white' : 'glass-card text-foam/50'}`}>
              {col.label}
            </button>
          ))}
        </div>

        {/* Items for active column */}
        <div className="space-y-3">
          {items.filter(item => item.col === activeCol).map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-foam font-bold text-sm">{item.title}</h3>
                  <p className="text-foam/50 text-xs mt-0.5">{item.desc}</p>
                </div>
                <button onClick={() => handleVote(item.id)}
                  className={`flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl border transition-all flex-shrink-0 ${voted.has(item.id) ? 'border-sun-400/50 bg-sun-500/10' : 'border-foam/10 glass-card'}`}>
                  <ChevronUp className={`w-4 h-4 ${voted.has(item.id) ? 'text-sun-400' : 'text-foam/40'}`} />
                  <span className={`font-display font-bold text-xs ${voted.has(item.id) ? 'text-sun-400' : 'text-foam/50'}`}>{item.votes}</span>
                </button>
              </div>
              {item.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {item.tags.map(tag => {
                    const s = TAG_STYLES[tag] || TAG_STYLES.Core;
                    const Icon = s.icon;
                    return (
                      <span key={tag} className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs ${s.bg} ${s.text}`}>
                        <Icon className="w-3 h-3" />{tag}
                      </span>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ))}
          {items.filter(item => item.col === activeCol).length === 0 && (
            <div className="text-center py-12 text-foam/40 text-sm">{t('roadmap.empty')}</div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}