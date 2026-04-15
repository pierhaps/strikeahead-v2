import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Search, MapPin, Loader2, Check } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import SunSparks from '../components/shared/SunSparks';
import { useTranslation } from 'react-i18next';

const tideEase = [0.2, 0.8, 0.2, 1];

const species = [
  { name: 'Hecht', emoji: '🐟', latin: 'Esox lucius' },
  { name: 'Zander', emoji: '🐠', latin: 'Sander lucioperca' },
  { name: 'Barsch', emoji: '🐡', latin: 'Perca fluviatilis' },
  { name: 'Karpfen', emoji: '🎣', latin: 'Cyprinus carpio' },
  { name: 'Forelle', emoji: '🐟', latin: 'Salmo trutta' },
  { name: 'Wels', emoji: '🐠', latin: 'Silurus glanis' },
];

export default function Upload() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [length, setLength] = useState(55);
  const [weight, setWeight] = useState(2.4);
  const [search, setSearch] = useState('');
  const [showSparks, setShowSparks] = useState(false);

  const steps = [t('upload.step_photo'), t('upload.step_species'), t('upload.step_measures'), t('upload.step_location')];

  const handlePhotoUpload = () => {
    setPhotoUploaded(true);
    setAiLoading(true);
    setTimeout(() => { setAiLoading(false); setAiDone(true); }, 2000);
  };

  const filteredSpecies = species.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4">
        <div className="mb-6">
          <p className="text-foam/50 text-sm">{t('upload.subtitle')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('upload.title')}</h1>
        </div>

        <div className="flex items-center gap-0 mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1">
                <motion.div animate={i <= step ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.3 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    i < step ? 'gradient-tide text-white' : i === step ? 'border-2 border-tide-400 text-tide-400' : 'bg-abyss-700 text-foam/30'}`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </motion.div>
                <span className={`text-[9px] font-medium ${i === step ? 'text-tide-400' : 'text-foam/30'}`}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-4 rounded-full overflow-hidden bg-abyss-700">
                  <motion.div className="h-full gradient-tide rounded-full"
                    animate={{ width: i < step ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: tideEase }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: tideEase }} className="space-y-4">
              <motion.button whileTap={{ scale: 0.97 }} onClick={handlePhotoUpload}
                className={`w-full h-52 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                  photoUploaded ? 'glass-card border border-tide-400/30' : 'border-2 border-dashed border-tide-400/30 bg-abyss-800/30'}`}>
                {aiLoading ? (
                  <>
                    <Loader2 className="w-10 h-10 text-tide-400 animate-spin" />
                    <p className="text-tide-300 font-medium">{t('upload.ai_running')}</p>
                    <p className="text-foam/30 text-xs">{t('upload.ai_identifying')}</p>
                  </>
                ) : aiDone ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl gradient-tide flex items-center justify-center">
                      <Check className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-tide-300 font-medium">{t('upload.ai_result', { species: 'Hecht' })}</p>
                    <p className="text-foam/40 text-xs">{t('upload.photo_uploaded')}</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-tide-500/10 border border-tide-400/20 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-tide-400" />
                    </div>
                    <p className="text-foam font-semibold">{t('upload.take_or_choose')}</p>
                    <p className="text-foam/30 text-xs">{t('upload.ai_auto_detect')}</p>
                  </>
                )}
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(1)}
                className="w-full py-4 rounded-2xl gradient-tide font-display font-bold text-white glow-tide">
                {aiDone ? t('upload.continue_with_ai') : t('common.skip')}
              </motion.button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: tideEase }} className="space-y-4">
              <div className="glass-card rounded-2xl flex items-center gap-3 px-4 py-3">
                <Search className="w-4 h-4 text-tide-400 flex-shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={t('upload.search_species')}
                  className="bg-transparent flex-1 text-foam placeholder-foam/30 text-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {filteredSpecies.map((s) => (
                  <motion.button key={s.name} whileTap={{ scale: 0.96 }} onClick={() => setSelectedSpecies(s.name)}
                    className={`p-4 rounded-2xl text-left transition-all duration-200 ${
                      selectedSpecies === s.name ? 'gradient-tide glow-tide' : 'glass-card border border-tide-300/10'}`}>
                    <div className="text-2xl mb-2">{s.emoji}</div>
                    <p className={`font-bold text-sm ${selectedSpecies === s.name ? 'text-white' : 'text-foam'}`}>{s.name}</p>
                    <p className={`text-xs italic ${selectedSpecies === s.name ? 'text-white/70' : 'text-foam/30'}`}>{s.latin}</p>
                  </motion.button>
                ))}
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(2)} disabled={!selectedSpecies}
                className={`w-full py-4 rounded-2xl font-display font-bold text-white transition-all ${
                  selectedSpecies ? 'gradient-tide glow-tide' : 'bg-abyss-700 text-foam/30'}`}>
                {t('common.next')}
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: tideEase }} className="space-y-6">
              {[
                { labelKey: 'upload.length', value: length, setValue: setLength, unit: 'cm', min: 5, max: 200, step: 1 },
                { labelKey: 'upload.weight', value: weight, setValue: setWeight, unit: 'kg', min: 0.1, max: 50, step: 0.1 },
              ].map((slider) => (
                <div key={slider.labelKey} className="glass-card rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-foam font-bold">{t(slider.labelKey)}</p>
                    <div className="px-3 py-1.5 rounded-xl gradient-tide">
                      <span className="text-white font-display font-bold">{slider.value} {slider.unit}</span>
                    </div>
                  </div>
                  <input type="range" min={slider.min} max={slider.max} step={slider.step} value={slider.value}
                    onChange={e => slider.setValue(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, #1FA7B8 0%, #4DC3D1 ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%, rgba(10,50,68,0.8) ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%, rgba(10,50,68,0.8) 100%)` }} />
                  <div className="flex justify-between mt-1">
                    <span className="text-foam/30 text-xs">{slider.min} {slider.unit}</span>
                    <span className="text-foam/30 text-xs">{slider.max} {slider.unit}</span>
                  </div>
                </div>
              ))}
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(3)}
                className="w-full py-4 rounded-2xl gradient-tide font-display font-bold text-white glow-tide">
                {t('common.next')}
              </motion.button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: tideEase }} className="space-y-4">
              <div className="h-48 rounded-3xl overflow-hidden relative glass-card">
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(14,64,84,0.8) 0%, rgba(2,21,33,0.95) 100%)' }}>
                  {[40,50,60,70,80].map(r => (
                    <div key={r} className="absolute rounded-full border border-tide-500/10"
                      style={{ width: `${r}%`, height: `${r}%`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <motion.div animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-tide-400" />
                    <div className="w-8 h-8 rounded-full gradient-tide glow-tide flex items-center justify-center relative">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-2xl glass-card border border-tide-400/30 flex items-center justify-center gap-2 font-semibold text-tide-400">
                <MapPin className="w-4 h-4" />
                {t('upload.use_location')}
              </motion.button>
              <div className="glass-card rounded-2xl flex items-center gap-3 px-4 py-3">
                <Search className="w-4 h-4 text-tide-400 flex-shrink-0" />
                <input placeholder={t('upload.search_water')}
                  className="bg-transparent flex-1 text-foam placeholder-foam/30 text-sm outline-none" />
              </div>
              <div className="relative">
                <SunSparks active={showSparks} onComplete={() => setShowSparks(false)} count={5} originX="50%" originY="50%" />
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowSparks(true)}
                  className="w-full py-4 rounded-2xl font-display font-bold text-white text-lg"
                  style={{ background: 'linear-gradient(90deg, #1FA7B8 0%, #F5C34B 100%)', boxShadow: '0 0 28px rgba(245,195,75,0.3)' }}>
                  {t('upload.save_catch')} 🎣
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="mt-4 text-foam/40 text-sm flex items-center gap-1">
            ← {t('common.back')}
          </button>
        )}
        <div className="h-4" />
      </div>
    </PageTransition>
  );
}