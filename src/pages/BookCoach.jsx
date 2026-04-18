import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, MapPin, Monitor, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageTransition from '../components/ui/PageTransition';
import PremiumGate from '../components/PremiumGate';
import { useLanguageContext } from '../hooks/useLanguage';

const FEATURE_LABELS = {
  de: "Coach-Buchung",
  en: "Coach Booking",
  es: "Reserva de Entrenador",
  fr: "Réservation d'Entraîneur",
  it: "Prenotazione Allenatore",
  nl: "Trainer Boeken",
  tr: "Antrenör Rezervasyonu",
  hr: "Rezervacija Trenera",
  pt: "Agendamento de Treinador",
  el: "Κράτηση Προπονητή",
  ru: "Бронирование Тренера",
};

const STEPS = ['bookcoach_step1','bookcoach_step2','bookcoach_step3','bookcoach_step4'];
const tideEase = [0.2, 0.8, 0.2, 1];

const AVAILABLE_TIMES = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'];

const localeTag = (code) => {
  const map = { de: 'de-DE', en: 'en-US', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', hr: 'hr-HR', pt: 'pt-PT', nl: 'nl-NL', tr: 'tr-TR', el: 'el-GR', sq: 'sq-AL' };
  return map[code] || 'de-DE';
};

export default function BookCoach() {
  const { t, i18n } = useTranslation();
  const { lang } = useLanguageContext();
  const location = useLocation();
  const [step, setStep] = useState(location.state?.coach ? 1 : 0);
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(location.state?.coach || null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [locationType, setLocationType] = useState('virtual');
  const [note, setNote] = useState('');
  const [user, setUser] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([base44.auth.me(), base44.entities.User.list('-total_coaching_sessions', 50)])
      .then(([u, users]) => { setUser(u); setCoaches(users.filter(u => u.is_coach)); });
  }, []);

  const totalPrice = (selectedCoach?.coach_hourly_rate || 0) * duration;

  const handleConfirm = async () => {
    await base44.entities.Booking.create({
      coach_email: selectedCoach.email,
      student_email: user?.email,
      date: selectedDate,
      time: selectedTime,
      duration_hours: duration,
      total_amount: totalPrice,
      location: locationType,
      notes: note,
      status: 'pending',
    });
    setSuccess(true);
  };

  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split('T')[0];
  });

  if (success) return (
    <PageTransition>
      <div className="px-4 pt-20 pb-4 text-center">
        <div className="w-20 h-20 rounded-3xl gradient-tide flex items-center justify-center text-4xl mx-auto mb-6 glow-tide">✓</div>
        <h2 className="font-display text-2xl font-bold text-foam mb-2">{t('community.bookcoach_success')}</h2>
        <p className="text-foam/50 text-sm">{t('bookcoach.confirmation_email')}</p>
      </div>
    </PageTransition>
  );

  return (
    <PremiumGate feature={FEATURE_LABELS[lang] || FEATURE_LABELS.en}>
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-5">
        <div>
          <p className="text-foam/50 text-sm">{t('community.bookcoach')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('community.bookcoach')}</h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'gradient-tide text-white' : i === step ? 'border-2 border-tide-400 text-tide-400' : 'bg-abyss-700 text-foam/30'}`}>
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-4 rounded-full bg-abyss-700 overflow-hidden">
                  <motion.div className="h-full gradient-tide rounded-full" animate={{ width: i < step ? '100%' : '0%' }} transition={{ duration: 0.5 }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Pick coach */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-3">
              {coaches.map(c => (
                <motion.div key={c.email} whileTap={{ scale: 0.97 }}
                  onClick={() => { setSelectedCoach(c); setStep(1); }}
                  className={`glass-card rounded-2xl p-4 flex items-center gap-3 cursor-pointer ${selectedCoach?.email === c.email ? 'border border-tide-400/50' : ''}`}>
                  <div className="w-12 h-12 rounded-2xl gradient-tide flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                    {c.profile_photo ? <img src={c.profile_photo} className="w-full h-full object-cover" alt="" /> : '🎣'}
                  </div>
                  <div className="flex-1">
                    <p className="text-foam font-bold text-sm">{c.full_name}</p>
                    <p className="text-sun-400 text-xs">{c.coach_hourly_rate || '–'} €/{t('bookcoach.hour_short')}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foam/30" />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Step 1: Date & time */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
              <p className="text-foam/50 text-sm">{t('community.bookcoach_step2')}</p>
              <div className="grid grid-cols-3 gap-2">
                {dates.map(d => (
                  <button key={d} onClick={() => setSelectedDate(d)}
                    className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${selectedDate === d ? 'gradient-tide text-white' : 'glass-card text-foam/60'}`}>
                    {new Date(d).toLocaleDateString(localeTag(i18n.language), { weekday: 'short', day: 'numeric', month: 'numeric' })}
                  </button>
                ))}
              </div>
              {selectedDate && (
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_TIMES.map(time => (
                    <button key={time} onClick={() => setSelectedTime(time)}
                      className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${selectedTime === time ? 'gradient-tide text-white' : 'glass-card text-foam/60'}`}>
                      {time}
                    </button>
                  ))}
                </div>
              )}
              <button disabled={!selectedDate || !selectedTime} onClick={() => setStep(2)}
                className={`w-full py-4 rounded-2xl font-bold text-white ${selectedDate && selectedTime ? 'gradient-tide' : 'bg-abyss-700 text-foam/30'}`}>
                {t('bookcoach.btn_next')}
              </button>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
              <div className="glass-card rounded-2xl p-4">
                <p className="text-foam/50 text-xs mb-3">{t('community.bookcoach_duration')}</p>
                <div className="flex gap-2">
                  {[1,2,3,4].map(h => (
                    <button key={h} onClick={() => setDuration(h)}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${duration === h ? 'gradient-tide text-white' : 'glass-card text-foam/60'}`}>
                      {h}h
                    </button>
                  ))}
                </div>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <p className="text-foam/50 text-xs mb-3">{t('community.bookcoach_location')}</p>
                <div className="flex gap-2">
                  <button onClick={() => setLocationType('virtual')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${locationType === 'virtual' ? 'gradient-tide text-white' : 'glass-card text-foam/60'}`}>
                    <Monitor className="w-4 h-4" />{t('community.bookcoach_virtual')}
                  </button>
                  <button onClick={() => setLocationType('onsite')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${locationType === 'onsite' ? 'gradient-tide text-white' : 'glass-card text-foam/60'}`}>
                    <MapPin className="w-4 h-4" />{t('community.bookcoach_onsite')}
                  </button>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <p className="text-foam/50 text-xs mb-2">{t('community.bookcoach_note')}</p>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                  className="w-full bg-transparent text-foam placeholder-foam/30 text-sm outline-none resize-none"
                  placeholder={t('bookcoach.note_placeholder')} />
              </div>
              <button onClick={() => setStep(3)} className="w-full py-4 rounded-2xl gradient-tide text-white font-bold">{t('bookcoach.btn_next')}</button>
            </motion.div>
          )}

          {/* Step 3: Summary */}
          {step === 3 && selectedCoach && (
            <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <h3 className="text-foam font-bold">{t('community.bookcoach_step4')}</h3>
                {[
                  [t('bookcoach.summary_coach'),   selectedCoach.full_name],
                  [t('bookcoach.label_date'),   selectedDate],
                  [t('bookcoach.label_time'), selectedTime],
                  [t('community.bookcoach_duration'), `${duration}h`],
                  [t('community.bookcoach_location'), locationType === 'virtual' ? t('community.bookcoach_virtual') : t('community.bookcoach_onsite')],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between border-b border-tide-400/10 pb-2">
                    <span className="text-foam/50 text-sm">{label}</span>
                    <span className="text-foam font-semibold text-sm">{val}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-foam/50 text-sm">{t('bookcoach.summary_total')}</span>
                  <span className="text-sun-400 font-display font-bold text-xl">{totalPrice.toFixed(2)} €</span>
                </div>
              </div>
              <button onClick={handleConfirm} className="w-full py-4 rounded-2xl font-display font-bold text-white text-lg"
                style={{ background: 'linear-gradient(90deg,#1FA7B8,#F5C34B)', boxShadow: '0 0 28px rgba(245,195,75,0.3)' }}>
                {t('community.bookcoach_confirm')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {step > 0 && !success && (
          <button onClick={() => setStep(s => s - 1)} className="text-foam/40 text-sm">← {t('bookcoach.btn_back')}</button>
        )}
      </div>
    </PageTransition>
    </PremiumGate>
  );
}