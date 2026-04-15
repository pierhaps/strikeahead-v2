import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Users, Camera, X, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import PageTransition from '../components/ui/PageTransition';

export default function CleanupChallenges() {
  const { t } = useTranslation();
  const [challenges, setChallenges] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.CleanupChallenge.list('-start_date', 50).then(setChallenges).finally(() => setLoading(false));
  }, []);

  const handleUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.CleanupChallenge.update(selected.id, {
        cleanup_proof_urls: [...(selected.cleanup_proof_urls || []), file_url],
        total_cleanup_photos: (selected.total_cleanup_photos || 0) + 1,
      });
      setChallenges(prev => prev.map(c => c.id === selected.id ? { ...c, cleanup_proof_urls: [...(c.cleanup_proof_urls || []), file_url] } : c));
      setSelected(prev => prev ? { ...prev, cleanup_proof_urls: [...(prev.cleanup_proof_urls || []), file_url] } : prev);
    };
    input.click();
  };

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div>
          <p className="text-foam/50 text-sm">{t('community.cleanup')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('community.cleanup')}</h1>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-16"><p className="text-5xl mb-4">🌿</p><p className="text-foam/50">{t('community.cleanup_empty')}</p></div>
        ) : (
          <div className="space-y-3">
            {challenges.map((ch, i) => (
              <motion.div key={ch.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(ch)}
                className="glass-card rounded-2xl p-4 space-y-3 cursor-pointer active:scale-[0.98] transition-transform">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-foam font-bold">{ch.name}</h3>
                    {ch.target_location && <p className="text-foam/40 text-xs mt-0.5">📍 {ch.target_location}</p>}
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${ch.status === 'active' ? 'bg-tide-500/20 text-tide-300' : 'bg-abyss-700 text-foam/40'}`}>
                    {ch.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="glass-card rounded-xl p-2">
                    <p className="text-tide-400 font-bold text-sm">{(ch.participants || []).length}</p>
                    <p className="text-foam/40 text-[10px]">{t('community.competitions_participants')}</p>
                  </div>
                  <div className="glass-card rounded-xl p-2">
                    <p className="text-sun-400 font-bold text-sm">{(ch.average_eco_score || 0).toFixed(1)}</p>
                    <p className="text-foam/40 text-[10px]">{t('community.cleanup_avg_eco')}</p>
                  </div>
                  <div className="glass-card rounded-xl p-2">
                    <p className="text-sun-400 font-bold text-sm">{ch.prize_hook_points || 0}</p>
                    <p className="text-foam/40 text-[10px]">HP</p>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-foam/30">
                  <span>{new Date(ch.start_date).toLocaleDateString('de-DE')}</span>
                  <span>→ {new Date(ch.end_date).toLocaleDateString('de-DE')}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
              onClick={e => e.target === e.currentTarget && setSelected(null)}>
              <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
                className="w-full max-w-lg glass-strong rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="font-display font-bold text-foam text-lg">{selected.name}</h2>
                  <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-foam/40" /></button>
                </div>

                <p className="text-foam/50 text-xs mb-3">{t('community.cleanup_gallery')}</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {(selected.cleanup_proof_urls || []).map((url, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-abyss-700">
                      <img src={url} className="w-full h-full object-cover" alt="" />
                    </div>
                  ))}
                </div>

                <button onClick={handleUpload}
                  className="w-full py-3.5 rounded-2xl gradient-tide text-white font-bold flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  {t('community.cleanup_upload')}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}