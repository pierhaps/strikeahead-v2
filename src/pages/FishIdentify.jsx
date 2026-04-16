import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image, Loader2, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';

const tideEase = [0.2, 0.8, 0.2, 1];

const RARITY_COLORS = { common: '#1FA7B8', uncommon: '#4DC3D1', rare: '#F5C34B', epic: '#FF6B5B', legendary: '#FFD872' };

export default function FishIdentify() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState('upload'); // upload | loading | result | fallback
  const [photoUrl, setPhotoUrl] = useState(null);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setPhase('loading');
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);

    const uploadedFile = await base44.integrations.Core.UploadFile({ file });
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Identify this fish species from the photo. Respond with JSON containing: name_de (German name), name_en (English name), scientific_name (Latin), confidence (0-100 integer), rarity (one of: common, uncommon, rare, epic, legendary), description_de (1 sentence in German).`,
      file_urls: [uploadedFile.file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          name_de: { type: 'string' },
          name_en: { type: 'string' },
          scientific_name: { type: 'string' },
          confidence: { type: 'number' },
          rarity: { type: 'string' },
          description_de: { type: 'string' },
          identified: { type: 'boolean' },
        }
      }
    });

    if (res.identified === false || res.confidence < 30) {
      setPhase('fallback');
    } else {
      setResult(res);
      setPhase('result');
    }
  };

  const reset = () => { setPhase('upload'); setPhotoUrl(null); setResult(null); };

  const getRarityLabel = (rarity) => {
    const key = `identify.rarity_${rarity}`;
    return t(key, rarity);
  };

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-6">
        <div>
          <p className="text-foam/50 text-sm">{t('identify.subtitle')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('identify.title')}</h1>
        </div>

        <AnimatePresence mode="wait">
          {/* Upload */}
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div className="glass-card rounded-3xl p-6 text-center"
                style={{ border: '2px dashed rgba(127,220,229,0.25)' }}>
                <div className="text-6xl mb-4">🐟</div>
                <p className="font-display font-bold text-foam text-lg mb-2">{t('identify.photo_upload')}</p>
                <p className="text-foam/40 text-sm mb-6">{t('identify.hero_desc')}</p>
                <div className="flex flex-col gap-3">
                  <button onClick={() => fileRef.current?.click()}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl gradient-tide text-white font-display font-bold glow-tide">
                    <Camera className="w-5 h-5" /> {t('identify.photo_capture')}
                  </button>
                  <button onClick={() => fileRef.current?.click()}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl glass-strong border border-tide-300/20 text-foam font-semibold">
                    <Image className="w-5 h-5 text-tide-400" /> {t('identify.from_gallery')}
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" capture="environment"
                  className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
              </div>

              <div className="glass-card rounded-2xl p-4 flex items-start gap-3"
                style={{ border: '1px solid rgba(245,195,75,0.15)' }}>
                <span className="text-xl">💡</span>
                <p className="text-foam/60 text-sm">{t('identify.tip_text')}</p>
              </div>
            </motion.div>
          )}

          {/* Loading */}
          {phase === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 pt-16">
              {photoUrl && (
                <div className="w-48 h-48 rounded-3xl overflow-hidden">
                  <img src={photoUrl} alt="Upload" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-tide flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
                <p className="font-display font-bold text-foam">{t('identify.analyzing')}</p>
                <p className="text-foam/40 text-sm">{t('identify.identifying')}</p>
              </div>
            </motion.div>
          )}

          {/* Result */}
          {phase === 'result' && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">
              {photoUrl && (
                <div className="h-52 rounded-3xl overflow-hidden relative">
                  <img src={photoUrl} alt="Fish" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-abyss-950 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(31,167,184,0.85)' }}>
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                    <span className="text-white text-xs font-bold">{t('identify.detected')}</span>
                  </div>
                </div>
              )}

              <div className="glass-card rounded-3xl p-5"
                style={{ border: `1px solid ${RARITY_COLORS[result.rarity] || '#1FA7B8'}33` }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-display font-extrabold text-foam text-2xl">{result.name_de}</h2>
                    <p className="text-foam/40 italic text-sm">{result.scientific_name}</p>
                    <p className="text-tide-400 text-xs mt-0.5">{result.name_en}</p>
                  </div>
                  <div className="text-right">
                    <div className="px-2.5 py-1 rounded-xl text-xs font-bold capitalize"
                      style={{ background: `${RARITY_COLORS[result.rarity]}22`, color: RARITY_COLORS[result.rarity], border: `1px solid ${RARITY_COLORS[result.rarity]}44` }}>
                      {getRarityLabel(result.rarity)}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foam/50">{t('identify.confidence')}</span>
                    <span className="font-bold text-tide-400">{result.confidence}%</span>
                  </div>
                  <div className="h-2 bg-abyss-700 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full gradient-tide"
                      initial={{ width: 0 }} animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }} />
                  </div>
                </div>

                {result.description_de && (
                  <p className="text-foam/60 text-sm leading-relaxed">{result.description_de}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={reset} className="flex-1 py-3.5 rounded-2xl glass-card text-foam/70 font-semibold">
                  {t('identify.new_photo')}
                </button>
                <button className="flex-1 py-3.5 rounded-2xl gradient-tide text-white font-display font-bold glow-tide flex items-center justify-center gap-2">
                  {t('identify.log_catch')} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Fallback */}
          {phase === 'fallback' && (
            <motion.div key="fallback" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div className="glass-card rounded-3xl p-8 text-center"
                style={{ border: '1px solid rgba(255,107,91,0.25)' }}>
                <AlertCircle className="w-12 h-12 text-coral-500 mx-auto mb-4" />
                <p className="font-display font-bold text-foam text-lg mb-2">{t('identify.not_detected')}</p>
                <p className="text-foam/50 text-sm mb-6">{t('identify.unable_msg')}</p>
                <div className="flex flex-col gap-3">
                  <button onClick={reset} className="py-3.5 rounded-2xl glass-strong border border-tide-300/20 text-foam font-semibold">
                    {t('identify.retry')}
                  </button>
                  <button className="py-3.5 rounded-2xl gradient-tide text-white font-display font-bold glow-tide">
                    {t('identify.manual_select')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-4" />
      </div>
    </PageTransition>
  );
}
