import React from 'react';
import { motion } from 'framer-motion';
import { Anchor, Zap, Leaf, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/ui/PageTransition';

const getHPTypes = (t) => [
  { type: 'catch_verified', label: t('anglersystem.hp_types.catch_verified'), hp: '+25', icon: '🎣' },
  { type: 'competition_win', label: t('anglersystem.hp_types.competition_win'), hp: '+500', icon: '🏆' },
  { type: 'challenge_complete', label: t('anglersystem.hp_types.challenge_complete'), hp: '+50-200', icon: '⚡' },
  { type: 'coach_feedback', label: t('anglersystem.hp_types.coach_feedback'), hp: '+15', icon: '🎓' },
  { type: 'review_posted', label: t('anglersystem.hp_types.review_posted'), hp: '+10', icon: '⭐' },
  { type: 'sponsor_reward', label: t('anglersystem.hp_types.sponsor_reward'), hp: t('anglersystem.hp_types.variable'), icon: '🎁' },
  { type: 'streak_milestone', label: t('anglersystem.hp_types.streak_milestone'), hp: '+100-500', icon: '🔥' },
  { type: 'community_verification', label: t('anglersystem.hp_types.community_verification'), hp: '+5', icon: '👍' },
  { type: 'premium_unlock', label: t('anglersystem.hp_types.premium_unlock'), hp: '-100', icon: '👑' },
  { type: 'tournament_entry', label: t('anglersystem.hp_types.tournament_entry'), hp: t('anglersystem.hp_types.variable'), icon: '⚓' },
];

const getLevels = (t) => [
  { level: 1, name: t('anglersystem.levels.beginner'), xp: 0 },
  { level: 5, name: t('anglersystem.levels.casual'), xp: 500 },
  { level: 10, name: t('anglersystem.levels.hobby'), xp: 2000 },
  { level: 15, name: t('anglersystem.levels.experienced'), xp: 5000 },
  { level: 20, name: t('anglersystem.levels.professional'), xp: 10000 },
  { level: 25, name: t('anglersystem.levels.elite'), xp: 25000 },
  { level: 30, name: t('anglersystem.levels.master'), xp: 50000 },
  { level: 50, name: t('anglersystem.levels.legend'), xp: 200000 },
];

export default function AnglerSystem() {
  const { t } = useTranslation();
  const HP_TYPES = React.useMemo(() => getHPTypes(t), [t]);
  const LEVELS = React.useMemo(() => getLevels(t), [t]);

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-6">
        <div>
          <p className="text-foam/50 text-sm">{t('community.system')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('community.system')}</h1>
        </div>

        {/* HP Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Anchor className="w-5 h-5 text-sun-400" />
            <h2 className="font-display font-bold text-foam text-lg">{t('community.system_how')}</h2>
          </div>
          <div className="space-y-2">
            {HP_TYPES.map((item, i) => (
              <motion.div key={item.type} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-xl w-8 text-center">{item.icon}</span>
                <span className="flex-1 text-foam text-sm">{item.label}</span>
                <span className={`font-display font-bold text-sm ${item.hp.startsWith('-') ? 'text-coral-500' : 'text-sun-400'}`}>{item.hp} HP</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* XP & Levels */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-tide-400" />
            <h2 className="font-display font-bold text-foam text-lg">{t('community.system_xp')}</h2>
          </div>
          <div className="glass-card rounded-2xl p-4 space-y-2">
            <p className="text-foam/50 text-sm leading-relaxed">{t('anglersystem.xp_desc')}</p>
          </div>
          <div className="space-y-1.5">
            {LEVELS.map((lv, i) => (
              <div key={lv.level} className="glass-card rounded-xl px-4 py-2.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
                  style={{ background: i >= 6 ? 'rgba(245,195,75,0.2)' : 'rgba(31,167,184,0.15)', color: i >= 6 ? '#F5C34B' : '#4DC3D1' }}>
                  {lv.level}
                </div>
                <div className="flex-1">
                  <p className="text-foam font-semibold text-sm">{lv.name}</p>
                </div>
                <p className="text-foam/40 text-xs font-display">{lv.xp.toLocaleString('de-DE')} XP</p>
              </div>
            ))}
          </div>
        </section>

        {/* Eco Score */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-400" />
            <h2 className="font-display font-bold text-foam text-lg">{t('community.system_eco')}</h2>
          </div>
          <div className="glass-card rounded-2xl p-5 space-y-3"
            style={{ border: '1px solid rgba(74,222,128,0.2)', background: 'rgba(74,222,128,0.04)' }}>
            <p className="text-foam/70 text-sm leading-relaxed">
              {t('anglersystem.eco.intro')}
            </p>
            {[
              ['🔄', t('anglersystem.eco.catch_release'), t('anglersystem.eco.points_2')],
              ['📸', t('anglersystem.eco.cleanup'), t('anglersystem.eco.points_15')],
              ['🗑', t('anglersystem.eco.trash_reported'), t('anglersystem.eco.points_1')],
              ['📏', t('anglersystem.eco.compliant'), t('anglersystem.eco.points_05')],
            ].map(([icon, label, pts]) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <span className="text-lg">{icon}</span>
                <span className="flex-1 text-foam/70">{label}</span>
                <span className="text-green-400 font-bold text-xs">{pts}</span>
              </div>
            ))}
            <p className="text-foam/40 text-xs mt-2">
              {t('anglersystem.eco.outro')}
            </p>
          </div>
        </section>

        <div className="h-4" />
      </div>
    </PageTransition>
  );
}