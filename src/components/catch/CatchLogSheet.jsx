import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, Camera, CheckCircle, Loader2, MapPin,
  Fish, Ruler, Weight, Anchor, FileText, Leaf,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { computeTrustScore } from '@/utils/trustEngine';
import { toast } from 'sonner';

/* ─── constants ──────────────────────────────────────────────────── */
const SPECIES = [
  'Hecht', 'Zander', 'Barsch', 'Karpfen', 'Forelle', 'Wels', 'Aal',
  'Dorsch', 'Makrele', 'Thunfisch', 'Wolfsbarsch', 'Barracuda', 'Bonito',
  'Brasse', 'Rotauge', 'Schleie', 'Lachs', 'Saibling', 'Hering', 'Scholle',
];
const BAITS = [
  'Gummifisch', 'Wobbler', 'Spinner', 'Blinker', 'Jig', 'Popper',
  'Crankbait', 'Softbait', 'Tauwurm', 'Maden', 'Mais', 'Boilie', 'Köderfisch',
];
const TECHNIQUES = [
  'Spinnfischen', 'Grundangeln', 'Fliegenfischen', 'Trolling', 'Jigging', 'Popping',
];

function getMoonPhase() {
  const diff = (new Date() - new Date(2000, 0, 6)) / 86400000;
  const p = ((diff % 29.53) + 29.53) % 29.53;
  if (p < 2 || p > 27.5) return 'Neumond';
  if (p < 8.5) return 'Zunehmend';
  if (p < 10) return 'Halbmond';
  if (p < 15.5) return 'Zunehmend';
  if (p < 17) return 'Vollmond';
  if (p < 23) return 'Abnehmend';
  return 'Halbmond';
}

function getSunPos(h) {
  if (h < 6) return 'before_sunrise';
  if (h < 10) return 'morning';
  if (h < 14) return 'midday';
  if (h < 18) return 'afternoon';
  if (h < 22) return 'evening';
  return 'after_sunset';
}

const STEP_LABELS = {
  de: ['Foto', 'Fischart', 'Maße', 'Details', 'Speichern'],
  en: ['Photo', 'Species', 'Size', 'Details', 'Save'],
};

/* ─── Progress dots ──────────────────────────────────────────────── */
function ProgressDots({ step, total }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === step ? 20 : 8,
            background: i <= step ? '#2EE0C9' : 'rgba(232,240,245,0.2)',
          }}
          transition={{ duration: 0.3 }}
          className="h-2 rounded-full"
        />
      ))}
    </div>
  );
}

/* ─── Big number input ───────────────────────────────────────────── */
function BigInput({ label, value, onChange, placeholder, unit }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-foam/50 text-xs font-semibold uppercase tracking-wider">{label}</p>
      <div className="relative flex items-center">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-36 text-center text-3xl font-display font-black text-foam bg-transparent outline-none border-b-2 border-tide-400/40 focus:border-tide-400 pb-1 transition-colors placeholder-foam/20"
        />
        {unit && <span className="ml-2 text-foam/40 text-base">{unit}</span>}
      </div>
    </div>
  );
}

/* ─── Step components ────────────────────────────────────────────── */
function StepPhoto({ photo, onPhoto, uploading }) {
  const { t } = useTranslation();
  const inputRef = useRef();
  return (
    <div className="flex flex-col items-center gap-5 py-4">
      {photo ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-52 h-52 rounded-3xl overflow-hidden"
          style={{ border: '2px solid rgba(46,224,201,0.4)' }}
        >
          <img src={photo} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => { onPhoto(null); }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-navy-900/80 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-foam" />
          </button>
          <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-tide-400/80 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      ) : (
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-52 h-52 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all"
          style={{ border: '2px dashed rgba(46,224,201,0.3)', background: 'rgba(46,224,201,0.05)' }}
        >
          {uploading
            ? <Loader2 className="w-12 h-12 text-tide-400 animate-spin" />
            : <Camera className="w-12 h-12 text-foam/30" />}
          <p className="text-sm text-foam/50 font-medium">
            {uploading ? t('upload.uploading') : t('upload.take_or_choose')}
          </p>
        </motion.button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onPhoto('loading');
          try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            onPhoto(file_url);
          } catch {
            onPhoto(null);
            toast.error('Foto-Upload fehlgeschlagen');
          }
        }}
      />
      <p className="text-foam/30 text-xs text-center">
        {t('upload.ai_auto_detect')}
      </p>
    </div>
  );
}

function StepSpecies({ value, onChange }) {
  const [search, setSearch] = useState('');
  const filtered = search
    ? SPECIES.filter(s => s.toLowerCase().includes(search.toLowerCase()))
    : SPECIES;
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Fischart suchen…"
        autoFocus
        className="w-full bg-abyss-700/50 border border-tide-400/20 rounded-xl px-4 py-3 text-foam placeholder-foam/30 text-sm outline-none focus:border-tide-400/50"
      />
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {filtered.map(s => (
          <motion.button
            key={s}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(s)}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all"
            style={
              value === s
                ? { background: 'rgba(46,224,201,0.12)', border: '1px solid rgba(46,224,201,0.35)' }
                : { background: 'rgba(232,240,245,0.04)', border: '1px solid transparent' }
            }
          >
            <div className="flex items-center gap-3">
              <Fish className="w-4 h-4 text-tide-400/60" />
              <span className={`text-sm font-medium ${value === s ? 'text-tide-300' : 'text-foam/80'}`}>{s}</span>
            </div>
            {value === s && <CheckCircle className="w-4 h-4 text-tide-400" />}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function StepMeasures({ length, weight, onLength, onWeight }) {
  return (
    <div className="flex flex-col items-center gap-8 py-4">
      <BigInput label="Länge" value={length} onChange={onLength} placeholder="45" unit="cm" />
      <div className="w-full h-px bg-foam/8" />
      <BigInput label="Gewicht" value={weight} onChange={onWeight} placeholder="2.5" unit="kg" />
    </div>
  );
}

function StepDetails({ bait, onBait, technique, onTechnique, spot, onSpot, notes, onNotes, released, onReleased }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-3">
      {/* Released toggle */}
      <button
        type="button"
        onClick={() => onReleased(!released)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
        style={released
          ? { background: 'rgba(46,224,201,0.12)', border: '1px solid rgba(46,224,201,0.35)' }
          : { background: 'rgba(232,240,245,0.04)', border: '1px solid rgba(232,240,245,0.08)' }}
      >
        <div className="flex items-center gap-3">
          <Leaf className={`w-4 h-4 ${released ? 'text-tide-400' : 'text-foam/40'}`} />
          <span className={`text-sm font-medium ${released ? 'text-tide-300' : 'text-foam/60'}`}>Catch &amp; Release</span>
        </div>
        <motion.div
          animate={{ background: released ? '#2EE0C9' : 'rgba(232,240,245,0.15)' }}
          className="w-10 h-5 rounded-full flex items-center px-0.5"
        >
          <motion.div
            animate={{ x: released ? 20 : 2 }}
            className="w-4 h-4 rounded-full bg-white shadow"
          />
        </motion.div>
      </button>

      {/* Collapsible extra details */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl glass-card text-sm font-medium text-foam/60"
      >
        <span>Optional: Köder, Technik, Spot, Notizen</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }}>▾</motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden space-y-3"
          >
            {[
              { label: 'Köder', value: bait, onChange: onBait, items: BAITS },
              { label: 'Technik', value: technique, onChange: onTechnique, items: TECHNIQUES },
            ].map(({ label, value, onChange, items }) => (
              <div key={label}>
                <p className="text-foam/40 text-xs mb-1">{label}</p>
                <select
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  className="w-full bg-abyss-700/50 border border-tide-400/20 rounded-xl px-3 py-2.5 text-sm text-foam outline-none appearance-none"
                >
                  <option value="">-- {label} wählen --</option>
                  {items.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            ))}
            <div>
              <p className="text-foam/40 text-xs mb-1">Gewässer</p>
              <input
                value={spot}
                onChange={e => onSpot(e.target.value)}
                placeholder="See, Fluss, Küste…"
                className="w-full bg-abyss-700/50 border border-tide-400/20 rounded-xl px-3 py-2.5 text-sm text-foam outline-none placeholder-foam/30"
              />
            </div>
            <div>
              <p className="text-foam/40 text-xs mb-1">Notizen</p>
              <textarea
                value={notes}
                onChange={e => onNotes(e.target.value)}
                placeholder="Beobachtungen, Tipps…"
                rows={3}
                className="w-full bg-abyss-700/50 border border-tide-400/20 rounded-xl px-3 py-2.5 text-sm text-foam outline-none placeholder-foam/30 resize-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepConfirm({ species, photo, length, weight, released, onSave, saving, savedOk }) {
  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <AnimatePresence mode="wait">
        {savedOk ? (
          <motion.div
            key="success"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(46,224,201,0.15)', border: '2px solid rgba(46,224,201,0.5)' }}>
              <CheckCircle className="w-12 h-12 text-tide-400" />
            </div>
            <p className="font-display font-extrabold text-xl text-foam">Fang gespeichert!</p>
            <p className="text-foam/40 text-sm">XP und HookPoints wurden gutgeschrieben</p>
          </motion.div>
        ) : (
          <motion.div key="confirm" className="w-full space-y-4">
            {/* Preview card */}
            <div className="glass-card rounded-2xl overflow-hidden flex gap-4 p-4">
              {photo && photo !== 'loading' ? (
                <img src={photo} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-abyss-700 flex items-center justify-center flex-shrink-0">
                  <Fish className="w-8 h-8 text-foam/20" />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <p className="font-display font-bold text-foam text-lg">{species || '—'}</p>
                <div className="flex gap-3 text-sm text-foam/60">
                  {length && <span className="flex items-center gap-1"><Ruler className="w-3 h-3" /> {length} cm</span>}
                  {weight && <span className="flex items-center gap-1"><Weight className="w-3 h-3" /> {weight} kg</span>}
                </div>
                {released && <span className="text-xs px-2 py-0.5 rounded-full bg-tide-400/10 text-tide-300">C&R 🌿</span>}
              </div>
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onSave}
              disabled={saving}
              className="w-full py-4 rounded-2xl font-display font-black text-base text-navy-900 flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                background: 'linear-gradient(225deg, #B6F03C 0%, #2EE0C9 55%, #2DA8FF 100%)',
                boxShadow: '0 10px 28px rgba(46,224,201,0.35)',
              }}
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {saving ? 'Wird gespeichert…' : 'Fang speichern'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Sheet ──────────────────────────────────────────────────── */
export default function CatchLogSheet({ open, onClose }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  // Form state
  const [photo, setPhoto]       = useState(null);
  const [species, setSpecies]   = useState('');
  const [length, setLength]     = useState('');
  const [weight, setWeight]     = useState('');
  const [bait, setBait]         = useState('');
  const [technique, setTech]    = useState('');
  const [spot, setSpot]         = useState('');
  const [notes, setNotes]       = useState('');
  const [released, setReleased] = useState(false);

  const lang = i18n.language?.split('-')[0] || 'de';
  const labels = STEP_LABELS[lang] || STEP_LABELS.de;
  const TOTAL = 5;

  // Reset when opened
  useEffect(() => {
    if (open) {
      setStep(0); setPhoto(null); setSpecies(''); setLength('');
      setWeight(''); setBait(''); setTech(''); setSpot('');
      setNotes(''); setReleased(false); setSaving(false); setSavedOk(false);
    }
  }, [open]);

  const handleSave = async () => {
    if (!species) { toast.error('Bitte Fischart wählen'); setStep(1); return; }
    setSaving(true);
    try {
      const now = new Date();
      const catchData = {
        species,
        photo_urls: photo && photo !== 'loading' ? [photo] : [],
        length_cm: length ? parseFloat(length) : null,
        weight_kg: weight ? parseFloat(weight) : null,
        bait: bait || null,
        technique: technique || null,
        waterbody: spot || null,
        description: notes || null,
        released,
        caught_date: now.toISOString().slice(0, 10),
        caught_time: now.toTimeString().slice(0, 5),
        moon_phase: getMoonPhase(),
        sun_position: getSunPos(now.getHours()),
        is_public: true,
        verification_level: 'unverified',
        verification_score: 0,
        fish_xp: 10,
        hook_points_earned: 10,
      };
      const trust = computeTrustScore(catchData);
      catchData.verification_level = trust.level;
      catchData.verification_score = trust.score;

      await base44.entities.Catch.create(catchData);
      await base44.auth.updateMe({
        total_catches: (user?.total_catches || 0) + 1,
        fish_xp: (user?.fish_xp || 0) + 10,
        hook_points: (user?.hook_points || 0) + 10,
      });

      setSavedOk(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      console.error(err);
      toast.error(t('upload.save_failed'));
    } finally {
      setSaving(false);
    }
  };

  const canNext = [
    true,                     // photo optional (skip allowed)
    !!species,                // must pick species
    true,                     // measures optional
    true,                     // details optional
    true,
  ][step];

  const stepContent = [
    <StepPhoto key="photo" photo={photo} onPhoto={setPhoto} uploading={photo === 'loading'} />,
    <StepSpecies key="species" value={species} onChange={setSpecies} />,
    <StepMeasures key="measures" length={length} weight={weight} onLength={setLength} onWeight={setWeight} />,
    <StepDetails key="details" bait={bait} onBait={setBait} technique={technique} onTechnique={setTech}
      spot={spot} onSpot={setSpot} notes={notes} onNotes={setNotes} released={released} onReleased={setReleased} />,
    <StepConfirm key="confirm" species={species} photo={photo} length={length} weight={weight}
      released={released} onSave={handleSave} saving={saving} savedOk={savedOk} />,
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(2,21,33,0.70)', backdropFilter: 'blur(4px)' }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: dragY }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.3 }}
            onDrag={(_, info) => setDragY(Math.max(0, info.offset.y))}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) onClose();
              else setDragY(0);
            }}
            className="fixed left-0 right-0 bottom-0 z-[61] flex flex-col rounded-t-[28px] overflow-hidden"
            style={{
              height: '85dvh',
              background: 'linear-gradient(180deg, rgba(14,30,48,0.97) 0%, rgba(10,24,40,0.99) 100%)',
              backdropFilter: 'blur(40px)',
              border: '0.5px solid rgba(232,240,245,0.1)',
              boxShadow: '0 -12px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-foam/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-foam/50 hover:text-foam hover:bg-foam/8 transition-all"
              >
                {step > 0 ? <ChevronLeft className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </button>
              <p className="font-display font-bold text-foam text-base">{labels[step]}</p>
              <div className="w-9" />
            </div>

            {/* Progress dots */}
            <div className="px-5 pb-4 flex-shrink-0">
              <ProgressDots step={step} total={TOTAL} />
            </div>

            {/* Step content */}
            <div className="flex-1 overflow-y-auto px-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  {stepContent[step]}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next / Skip button (hidden on confirm step) */}
            {step < TOTAL - 1 && (
              <div className="px-5 pb-6 pt-3 flex-shrink-0"
                style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canNext}
                  className="w-full py-4 rounded-2xl font-display font-bold text-base disabled:opacity-40 transition-all"
                  style={canNext
                    ? { background: 'linear-gradient(135deg, #2DA8FF, #2EE0C9)', color: '#021521' }
                    : { background: 'rgba(232,240,245,0.08)', color: 'rgba(232,240,245,0.3)' }}
                >
                  {step === 0 && !photo ? 'Überspringen →' : 'Weiter →'}
                </motion.button>
              </div>
            )}
            {step === TOTAL - 1 && (
              <div className="h-6 flex-shrink-0"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}