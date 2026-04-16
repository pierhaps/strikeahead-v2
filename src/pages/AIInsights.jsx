import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Bell, Leaf, TrendingUp, MapPin, Fish, BookOpen, Trophy, Zap, CloudRain, Star } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import PaywallModal from '../components/shared/PaywallModal';
import { useEntitlement } from '@/hooks/useEntitlement';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';

const tideEase = [0.2, 0.8, 0.2, 1];

const INSIGHT_ICON_MAP = {
  regulation_alert: BookOpen, seasonal_tip: Star, technique_suggestion: TrendingUp,
  location_recommendation: MapPin, species_opportunity: Fish, eco_alert: Leaf,
  churn_prevention: Bell, challenge_suggestion: Trophy, coaching_match: Star,
  gear_recommendation: Zap, weather_window: CloudRain, trophy_chance: Trophy,
};
const INSIGHT_COLOR_MAP = {
  regulation_alert: '#FF6B5B', seasonal_tip: '#F5C34B', technique_suggestion: '#1FA7B8',
  location_recommendation: '#4DC3D1', species_opportunity: '#7FDCE5', eco_alert: '#4DC3D1',
  churn_prevention: '#F5C34B', challenge_suggestion: '#FFD872', coaching_match: '#F5C34B',
  gear_recommendation: '#7FDCE5', weather_window: '#1FA7B8', trophy_chance: '#F5C34B',
};

export default function AIInsights() {
  const { t } = useTranslation();
  const { canAccess, requiredTier } = useEntitlement();
  const hasAccess = canAccess('ai_insights');
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('unread');

  useEffect(() => {
    Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.AIInsight.list('-created_date', 100),
    ]).then(([u, data]) => {
      setUser(u);
      setInsights((data || []).filter(i => !i.user_email || i.user_email === u?.email));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const markSeen = (id) => {
    base44.entities.AIInsight.update(id, { was_seen: true });
    setInsights(prev => prev.map(i => i.id === id ? { ...i, was_seen: true } : i));
  };

  const rate = (id, rating) => {
    base44.entities.AIInsight.update(id, { user_rating: rating, was_acted_on: true });
    setInsights(prev => prev.map(i => i.id === id ? { ...i, user_rating: rating, was_acted_on: true } : i));
  };

  const insightTypeLabel = (type) => t(`insights.type_${type}`, { defaultValue: t('insights.type_hint') });
  const priorityLabel = (p) => t(`insights.priority_${p}`, { defaultValue: p });
  const priorityBg = { low: 'rgba(77,195,209,0.1)', medium: 'rgba(245,195,75,0.1)', high: 'rgba(255,107,91,0.12)', urgent: 'rgba(255,216,114,0.15)' };
  const priorityColor = { low: '#4DC3D1', medium: '#F5C34B', high: '#FF6B5B', urgent: '#FFD872' };

  const unread = insights.filter(i => !i.was_seen);
  const shown = filter === 'unread' ? unread : insights;

  if (loading) return <PageTransition><div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" /></div></PageTransition>;

  return (
    <PageTransition>
      {!hasAccess && (
        <PaywallModal open={true} onClose={() => window.history.back()} featureKey="ai_insights" requiredTier={requiredTier('ai_insights')} />
      )}
      {hasAccess && (
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-foam/50 text-sm">{t('insights.subtitle')}</p>
            <h1 className="font-display text-2xl font-extrabold text-foam">{t('insights.title')}</h1>
          </div>
          {unread.length > 0 && (
            <div className="w-8 h-8 rounded-full gradient-tide flex items-center justify-center glow-tide">
              <span className="text-white font-bold text-xs">{unread.length}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {[
            ['unread', t('insights.tab_unread', { n: unread.length })],
            ['all', t('insights.tab_all', { n: insights.length })],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${filter === key ? 'gradient-tide text-white' : 'glass-card text-foam/60'}`}>
              {label}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center mt-8">
            <div className="text-5xl mb-4">🤖</div>
            <p className="font-display font-bold text-foam text-lg">{t('insights.empty_title')}</p>
            <p className="text-foam/40 text-sm mt-2">{t('insights.empty_sub')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {shown.map((ins, i) => {
                const InsIcon = INSIGHT_ICON_MAP[ins.insight_type] || Bell;
                const color = INSIGHT_COLOR_MAP[ins.insight_type] || '#1FA7B8';
                const prio = ins.priority || 'medium';
                const isRated = ins.user_rating && ins.user_rating !== 'not_rated';

                return (
                  <motion.div key={ins.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }} transition={{ delay: i * 0.04, ease: tideEase }}
                    onClick={() => !ins.was_seen && markSeen(ins.id)}
                    className={`glass-card rounded-2xl p-4 transition-all ${!ins.was_seen ? 'border border-tide-400/25' : ''}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                        <InsIcon className="w-5 h-5" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-[10px] font-bold" style={{ color }}>{insightTypeLabel(ins.insight_type)}</span>
                          <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold"
                            style={{ background: priorityBg[prio] || priorityBg.medium, color: priorityColor[prio] || priorityColor.medium }}>
                            {priorityLabel(prio)}
                          </span>
                          {!ins.was_seen && <span className="w-1.5 h-1.5 rounded-full bg-tide-400" />}
                        </div>
                        <p className="font-display font-bold text-foam text-sm leading-tight">{ins.title}</p>
                      </div>
                    </div>

                    <p className="text-foam/60 text-sm leading-relaxed mb-3">{ins.content}</p>

                    {ins.confidence_score != null && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-foam/30 text-xs">{t('insights.confidence')}</span>
                        <div className="flex-1 h-1 bg-abyss-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full gradient-tide" style={{ width: `${ins.confidence_score}%` }} />
                        </div>
                        <span className="text-tide-400 text-xs font-bold">{ins.confidence_score}%</span>
                      </div>
                    )}

                    {!isRated ? (
                      <div className="flex items-center gap-2 pt-2 border-t border-tide-300/10">
                        <span className="text-foam/30 text-xs flex-1">{t('insights.helpful_q')}</span>
                        <button onClick={e => { e.stopPropagation(); rate(ins.id, 'helpful'); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card text-tide-400 text-xs font-semibold hover:bg-tide-500/15 transition-all">
                          <ThumbsUp className="w-3.5 h-3.5" /> {t('common.yes')}
                        </button>
                        <button onClick={e => { e.stopPropagation(); rate(ins.id, 'not_helpful'); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card text-foam/40 text-xs font-semibold hover:bg-abyss-700 transition-all">
                          <ThumbsDown className="w-3.5 h-3.5" /> {t('common.no')}
                        </button>
                        <button onClick={e => { e.stopPropagation(); rate(ins.id, 'irrelevant'); }}
                          className="px-3 py-1.5 rounded-xl glass-card text-foam/30 text-xs font-semibold hover:bg-abyss-700 transition-all">
                          {t('insights.irrelevant')}
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-tide-300/10 text-xs text-foam/30 flex items-center gap-1.5">
                        <ThumbsUp className="w-3 h-3" />
                        {ins.user_rating === 'helpful' ? t('insights.rated_helpful') :
                         ins.user_rating === 'not_helpful' ? t('insights.rated_not_helpful') :
                         t('insights.rated_irrelevant')}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
        <div className="h-4" />
      </div>
      )}
    </PageTransition>
  );
}