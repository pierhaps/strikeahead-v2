import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

const tideEase = [0.2, 0.8, 0.2, 1];

const SKILL_KEYS = [
  'lure_selection','location_scouting','weather_reading','species_knowledge',
  'technique_mastery','eco_awareness','catch_consistency','trophy_hunting',
  'saltwater','freshwater','fly_fishing','spinning','bottom_fishing',
];
const SKILL_DEFAULTS = {
  lure_selection: 'Köder-Wahl',
  location_scouting: 'Spot-Scouting',
  weather_reading: 'Wetter-Lesen',
  species_knowledge: 'Artkenntnis',
  technique_mastery: 'Technik',
  eco_awareness: 'Eco-Bewusstsein',
  catch_consistency: 'Konstanz',
  trophy_hunting: 'Trophy',
  saltwater: 'Meerwasser',
  freshwater: 'Süßwasser',
  fly_fishing: 'Fliegenfischen',
  spinning: 'Spinnfischen',
  bottom_fishing: 'Grundangeln',
};

function TrendIcon({ trend }) {
  if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-tide-400" />;
  if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-coral-500" />;
  return <Minus className="w-4 h-4 text-foam/40" />;
}

export default function SkillProfile() {
  const { t } = useTranslation();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const SKILL_LABELS = useMemo(() => Object.fromEntries(
    SKILL_KEYS.map(k => [k, t(`skillprofile.skill_${k}`, { defaultValue: SKILL_DEFAULTS[k] })])
  ), [t]);

  useEffect(() => {
    Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.UserSkillProfile.list('-skill_level', 50),
    ]).then(([u, data]) => {
      setUser(u);
      const mine = (data || []).filter(s => s.user_email === u?.email);
      setSkills(mine);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const radarData = skills.map(s => ({
    skill: SKILL_LABELS[s.skill_category] || s.skill_category,
    value: s.skill_level || 0,
    fullMark: 100,
  }));

  if (loading) return (
    <PageTransition><div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" />
    </div></PageTransition>
  );

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-6">
        <div>
          <p className="text-foam/50 text-sm">{t('skillprofile.subtitle', { defaultValue: 'Dein Können' })}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('skillprofile.title', { defaultValue: 'Skill-Profil' })}</h1>
        </div>

        {skills.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center mt-12">
            <div className="text-5xl mb-4">🎯</div>
            <p className="font-display font-bold text-foam text-lg">{t('skillprofile.empty_title', { defaultValue: 'Noch keine Skill-Daten' })}</p>
            <p className="text-foam/40 text-sm mt-2 mb-6">{t('skillprofile.empty_hint', { defaultValue: 'Logge Fänge um dein Skill-Profil aufzubauen' })}</p>
            <Link to="/upload" className="inline-block px-6 py-3 rounded-2xl gradient-tide text-white font-bold text-sm glow-tide">
              {t('skillprofile.empty_cta', { defaultValue: 'Ersten Fang loggen' })}
            </Link>
          </div>
        ) : (
          <>
            {/* Radar */}
            <div className="glass-card rounded-3xl p-4">
              <p className="font-display font-bold text-foam text-sm mb-2 text-center">{t('skillprofile.radar_title', { defaultValue: 'Skill-Radar' })}</p>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="rgba(127,220,229,0.15)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: 'rgba(234,248,250,0.5)', fontSize: 9 }} />
                  <Radar name={t('skillprofile.radar_name', { defaultValue: 'Skills' })} dataKey="value" stroke="#1FA7B8" fill="#1FA7B8" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Skill cards */}
            <div className="space-y-2">
              {skills.map((s, i) => {
                const hasGap = s.coaching_gap;
                return (
                  <motion.div key={s.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, ease: tideEase }}
                    className="glass-card rounded-2xl p-4"
                    style={hasGap ? { border: '1px solid rgba(245,195,75,0.2)' } : {}}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-foam font-semibold text-sm">{SKILL_LABELS[s.skill_category] || s.skill_category}</p>
                          <TrendIcon trend={s.trend} />
                          {hasGap && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                              style={{ background: 'rgba(245,195,75,0.15)', color: '#F5C34B' }}>{t('skillprofile.coaching_recommended', { defaultValue: 'Coaching empfohlen' })}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-abyss-700 rounded-full overflow-hidden">
                            <motion.div className="h-full rounded-full"
                              style={{ background: s.skill_level >= 70 ? '#F5C34B' : '#1FA7B8' }}
                              initial={{ width: 0 }} animate={{ width: `${s.skill_level}%` }}
                              transition={{ duration: 0.8, delay: i * 0.04 }} />
                          </div>
                          <span className="text-foam/60 text-xs font-bold w-8 text-right">{s.skill_level}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {s.peer_percentile != null && (
                          <p className="text-tide-400 text-xs font-semibold">{t('skillprofile.top_percentile', { pct: 100 - Math.round(s.peer_percentile), defaultValue: 'Top {{pct}}%' })}</p>
                        )}
                        {s.confidence != null && (
                          <p className="text-foam/30 text-[10px]">{t('skillprofile.confidence', { pct: s.confidence, defaultValue: '{{pct}}% Konfidenz' })}</p>
                        )}
                      </div>
                    </div>
                    {hasGap && (
                      <Link to="/coaches" className="mt-2 flex items-center gap-1 text-sun-400 text-xs font-semibold">
                        {t('skillprofile.find_coach', { defaultValue: 'Coach finden' })} <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
        <div className="h-4" />
      </div>
    </PageTransition>
  );
}
