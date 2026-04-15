import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Bell, Leaf, TrendingUp, MapPin, Fish, BookOpen, Trophy, Zap, CloudRain, Star } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';

const tideEase = [0.2, 0.8, 0.2, 1];

const INSIGHT_CFG = {
  regulation_alert: { icon: BookOpen, color: '#FF6B5B', label: 'Vorschrift' },
  seasonal_tip: { icon: Star, color: '#F5C34B', label: 'Saison-Tipp' },
  technique_suggestion: { icon: TrendingUp, color: '#1FA7B8', label: 'Technik' },
  location_recommendation: { icon: MapPin, color: '#4DC3D1', label: 'Spot' },
  species_opportunity: { icon: Fish, color: '#7FDCE5', label: 'Art-Chance' },
  eco_alert: { icon: Leaf, color: '#4DC3D1', label: 'Eco' },
  churn_prevention: { icon: Bell, color: '#F5C34B', label: 'Hinweis' },
  challenge_suggestion: { icon: Trophy, color: '#FFD872', label: 'Challenge' },
  coaching_match: { icon: Star, color: '#F5C34B', label: 'Coach' },
  gear_recommendation: { icon: Zap, color: '#7FDCE5', label: 'Ausrüstung' },
  weather_window: { icon: CloudRain, color: '#1FA7B8', label: 'Wetterfenster' },
  trophy_chance: { icon: Trophy, color: '#F5C34B', label: 'Trophy' },
};

const PRIORITY_CFG = {
  low: { label: 'Info', color: '#4DC3D1', bg: 'rgba(77,195,209,0.1)' },
  medium: { label: 'Mittel', color: '#F5C34B', bg: 'rgba(245,195,75,0.1)' },
  high: { label: 'Wichtig', color: '#FF6B5B', bg: 'rgba(255,107,91,0.12)' },
  urgent: { label: 'Dringend ⚡', color: '#FFD872', bg: 'rgba(255,216,114,0.15)' },
};

export default function AIInsights() {
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
      const mine = (data || []).filter(i => !i.user_email || i.user_email === u?.email);
      setInsights(mine);
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

  const unread = insights.filter(i => !i.was_seen);
  const shown = filter === 'unread' ? unread : insights;

  if (loading) return <PageTransition><div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" /></div></PageTransition>;

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-foam/50 text-sm">KI-Empfehlungen</p>
            <h1 className="font-display text-2xl font-extrabold text-foam">AI Insights</h1>
          </div>
          {unread.length > 0 && (
            <div className="w-8 h-8 rounded-full gradient-tide flex items-center justify-center glow-tide">
              <span className="text-white font-bold text-xs">{unread.length}</span>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[['unread', `Ungelesen (${unread.length})`], ['all', `Alle (${insights.length})`]].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${filter === key ? 'gradient-tide text-white' : 'glass-card text-foam/60'}`}>
              {label}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center mt-8">
            <div className="text-5xl mb-4">🤖</div>
            <p className="font-display font-bold text-foam text-lg">Keine Insights</p>
            <p className="text-foam/40 text-sm mt-2">Logge mehr Fänge, damit die KI dir personalisierte Tipps geben kann</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {shown.map((ins, i) => {
                const cfg = INSIGHT_CFG[ins.insight_type] || { icon: Bell, color: '#1FA7B8', label: 'Hinweis' };
                const InsIcon = cfg.icon;
                const prio = PRIORITY_CFG[ins.priority] || PRIORITY_CFG.medium;
                const isRated = ins.user_rating && ins.user_rating !== 'not_rated';

                return (
                  <motion.div key={ins.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.04, ease: tideEase }}
                    onClick={() => !ins.was_seen && markSeen(ins.id)}
                    className={`glass-card rounded-2xl p-4 transition-all ${!ins.was_seen ? 'border border-tide-400/25' : ''}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}30` }}>
                        <InsIcon className="w-5 h-5" style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-[10px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                          <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold"
                            style={{ background: prio.bg, color: prio.color }}>{prio.label}</span>
                          {!ins.was_seen && <span className="w-1.5 h-1.5 rounded-full bg-tide-400" />}
                        </div>
                        <p className="font-display font-bold text-foam text-sm leading-tight">{ins.title}</p>
                      </div>
                    </div>

                    <p className="text-foam/60 text-sm leading-relaxed mb-3">{ins.content}</p>

                    {ins.confidence_score != null && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-foam/30 text-xs">Konfidenz</span>
                        <div className="flex-1 h-1 bg-abyss-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full gradient-tide" style={{ width: `${ins.confidence_score}%` }} />
                        </div>
                        <span className="text-tide-400 text-xs font-bold">{ins.confidence_score}%</span>
                      </div>
                    )}

                    {/* Rating */}
                    {!isRated ? (
                      <div className="flex items-center gap-2 pt-2 border-t border-tide-300/10">
                        <span className="text-foam/30 text-xs flex-1">War das hilfreich?</span>
                        <button onClick={e => { e.stopPropagation(); rate(ins.id, 'helpful'); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card text-tide-400 text-xs font-semibold hover:bg-tide-500/15 transition-all">
                          <ThumbsUp className="w-3.5 h-3.5" /> Ja
                        </button>
                        <button onClick={e => { e.stopPropagation(); rate(ins.id, 'not_helpful'); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card text-foam/40 text-xs font-semibold hover:bg-abyss-700 transition-all">
                          <ThumbsDown className="w-3.5 h-3.5" /> Nein
                        </button>
                        <button onClick={e => { e.stopPropagation(); rate(ins.id, 'irrelevant'); }}
                          className="px-3 py-1.5 rounded-xl glass-card text-foam/30 text-xs font-semibold hover:bg-abyss-700 transition-all">
                          Irrelevant
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-tide-300/10 text-xs text-foam/30 flex items-center gap-1.5">
                        <ThumbsUp className="w-3 h-3" />
                        {ins.user_rating === 'helpful' ? 'Als hilfreich markiert' : ins.user_rating === 'not_helpful' ? 'Als nicht hilfreich markiert' : 'Als irrelevant markiert'}
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
    </PageTransition>
  );
}