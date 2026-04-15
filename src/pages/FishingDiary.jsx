import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wind, Fish } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';

const MOOD_EMOJI = { amazing: '🤩', great: '😄', good: '🙂', okay: '😐', tough: '😤' };

function NewEntryModal({ onClose, onSave, t }) {
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], title: '', mood: 'good', highlights: '', personal_notes: '' });
  const [saving, setSaving] = useState(false);

  const MOOD_LABELS = {
    amazing: t('diary.mood_amazing'),
    great: t('diary.mood_great'),
    good: t('diary.mood_good'),
    okay: t('diary.mood_okay'),
    tough: t('diary.mood_tough'),
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.DiaryEntry.create(form);
    onSave();
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(2,21,33,0.75)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="glass-strong rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-foam/20 rounded-full mx-auto" />
        <h3 className="font-display font-bold text-foam text-lg">{t('diary.new_entry')}</h3>
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <span className="text-foam/60 text-sm">{t('diary.date')}</span>
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="bg-transparent text-foam text-sm text-right outline-none" />
        </div>
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder={t('diary.title_placeholder')}
          className="w-full glass-card rounded-2xl px-4 py-3 text-foam placeholder-foam/30 text-sm outline-none border-none" />
        <div className="glass-card rounded-2xl p-4">
          <p className="text-foam/50 text-xs mb-3">{t('diary.how_was_day')}</p>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(MOOD_EMOJI).map(([key, emoji]) => (
              <button key={key} onClick={() => setForm(f => ({ ...f, mood: key }))}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${form.mood === key ? 'gradient-tide text-white' : 'bg-abyss-700 text-foam/60'}`}>
                {emoji} {MOOD_LABELS[key]}
              </button>
            ))}
          </div>
        </div>
        <textarea value={form.highlights} onChange={e => setForm(f => ({ ...f, highlights: e.target.value }))}
          placeholder={t('diary.highlights_placeholder')} rows={3}
          className="w-full glass-card rounded-2xl px-4 py-3 text-foam placeholder-foam/30 text-sm outline-none border-none resize-none" />
        <textarea value={form.personal_notes} onChange={e => setForm(f => ({ ...f, personal_notes: e.target.value }))}
          placeholder={t('diary.notes_placeholder')} rows={3}
          className="w-full glass-card rounded-2xl px-4 py-3 text-foam placeholder-foam/30 text-sm outline-none border-none resize-none" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl glass-card text-foam/60 font-semibold">{t('common.cancel')}</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3.5 rounded-2xl gradient-tide text-white font-display font-bold glow-tide">
            {saving ? '…' : t('common.save')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FishingDiary() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  const load = () => {
    base44.entities.DiaryEntry.list('-date', 100).then(data => {
      setEntries(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <PageTransition><div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" />
    </div></PageTransition>
  );

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-24 space-y-4">
        <div>
          <p className="text-foam/50 text-sm">{t('diary.subtitle')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('diary.title')}</h1>
        </div>

        {entries.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center mt-8">
            <div className="text-5xl mb-4">📔</div>
            <p className="font-display font-bold text-foam text-lg">{t('diary.empty_title')}</p>
            <p className="text-foam/40 text-sm mt-2 mb-6">{t('diary.empty_sub')}</p>
            <button onClick={() => setShowNew(true)}
              className="inline-block px-6 py-3 rounded-2xl gradient-tide text-white font-bold text-sm glow-tide">
              {t('diary.create_first')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="glass-card rounded-3xl overflow-hidden">
                {e.photos?.[0] && (
                  <div className="h-40 relative">
                    <img src={e.photos[0]} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-abyss-950/80 to-transparent" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{MOOD_EMOJI[e.mood] || '🙂'}</span>
                        <p className="font-display font-bold text-foam">{e.title || e.date}</p>
                      </div>
                      <p className="text-foam/40 text-xs mt-0.5">{e.date}</p>
                    </div>
                    {e.total_catches > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                        style={{ background: 'rgba(31,167,184,0.12)', border: '1px solid rgba(31,167,184,0.2)' }}>
                        <Fish className="w-3.5 h-3.5 text-tide-400" />
                        <span className="text-tide-300 font-bold text-xs">{e.total_catches}</span>
                      </div>
                    )}
                  </div>
                  {e.weather_summary && (
                    <p className="text-foam/50 text-xs mb-2 flex items-center gap-1.5">
                      <Wind className="w-3 h-3" /> {e.weather_summary}
                    </p>
                  )}
                  {e.highlights && <p className="text-foam/70 text-sm leading-relaxed mb-2">{e.highlights}</p>}
                  {e.tags?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {e.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-abyss-700 text-foam/50 rounded-lg text-[10px]">#{tag}</span>
                      ))}
                    </div>
                  )}
                  {e.ai_tips?.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl"
                      style={{ background: 'rgba(245,195,75,0.06)', border: '1px solid rgba(245,195,75,0.15)' }}>
                      <p className="text-sun-400/70 text-[10px] uppercase tracking-widest mb-1.5">{t('diary.ai_tip')}</p>
                      <p className="text-foam/60 text-xs">{e.ai_tips[0]}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <motion.button whileTap={{ scale: 0.93 }} onClick={() => setShowNew(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full gradient-tide glow-tide flex items-center justify-center z-40 shadow-xl">
        <Plus className="w-7 h-7 text-white" />
      </motion.button>

      <AnimatePresence>
        {showNew && <NewEntryModal onClose={() => setShowNew(false)} onSave={load} t={t} />}
      </AnimatePresence>
    </PageTransition>
  );
}