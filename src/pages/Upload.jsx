import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Upload as UploadIcon, MapPin, Loader2, Check, Search, X, Sparkles,
  Thermometer, Wind, Droplets, Sun, Moon, Clock, Fish,
} from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../components/ui/PageTransition';
import SunSparks from '../components/shared/SunSparks';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const tideEase = [0.2, 0.8, 0.2, 1];

// --- Helpers ------------------------------------------------------------

function getSunPosition(hour) {
  if (hour < 6) return 'before_sunrise';
  if (hour < 10) return 'morning';
  if (hour < 14) return 'midday';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'after_sunset';
}

function degToDirection(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function getMoonPhase() {
  const now = new Date();
  const known = new Date(2000, 0, 6);
  const diff = (now - known) / (1000 * 60 * 60 * 24);
  const cycle = 29.53;
  const phase = ((diff % cycle) + cycle) % cycle;
  if (phase < 2 || phase > 27.5) return 'Neumond';
  if (phase < 8.5) return 'Zunehmend';
  if (phase < 10) return 'Halbmond';
  if (phase < 15.5) return 'Zunehmend';
  if (phase < 17) return 'Vollmond';
  if (phase < 23) return 'Abnehmend';
  if (phase < 24.5) return 'Halbmond';
  return 'Abnehmend';
}

// Species (id = Base44 key, localised via t())
const SPECIES = [
  { id: 'hecht',      latin: 'Esox lucius',        emoji: '🐟' },
  { id: 'zander',     latin: 'Sander lucioperca',  emoji: '🐠' },
  { id: 'barsch',     latin: 'Perca fluviatilis',  emoji: '🐡' },
  { id: 'karpfen',    latin: 'Cyprinus carpio',    emoji: '🎣' },
  { id: 'forelle',    latin: 'Salmo trutta',       emoji: '🐟' },
  { id: 'wels',       latin: 'Silurus glanis',     emoji: '🐠' },
  { id: 'aal',        latin: 'Anguilla anguilla',  emoji: '🐍' },
  { id: 'dorsch',     latin: 'Gadus morhua',       emoji: '🐟' },
  { id: 'makrele',    latin: 'Scomber scombrus',   emoji: '🐟' },
  { id: 'wolfsbarsch', latin: 'Dicentrarchus labrax', emoji: '🐟' },
  { id: 'thunfisch',  latin: 'Thunnus thynnus',    emoji: '🐡' },
  { id: 'barracuda',  latin: 'Sphyraena',          emoji: '🐟' },
];

const STEPS = ['photo', 'species', 'measures', 'location'];

// --- Component ----------------------------------------------------------

export default function Upload() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showSparks, setShowSparks] = useState(false);

  // Photo
  const [uploading, setUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]); // urls
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null); // { species_detected, strike_score, ... }

  // Species & measures
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(null);
  const [search, setSearch] = useState('');
  const [length, setLength] = useState(55);
  const [weight, setWeight] = useState(2.4);
  const [waterbody, setWaterbody] = useState('');

  // Location & weather
  const [gpsLocation, setGpsLocation] = useState(null);
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [weather, setWeather] = useState(null); // { air_temp_c, wind_speed_kmh, wind_direction, pressure, ... }

  // --- Photo upload ---
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(
        files.map((f) => base44.integrations.Core.UploadFile({ file: f }))
      );
      const urls = results.map((r) => r.file_url).filter(Boolean);
      setUploadedPhotos((prev) => [...prev, ...urls]);
      if (urls[0]) {
        setAiLoading(true);
        try {
          const ai = await base44.integrations.Core.InvokeLLM({
            prompt:
              'Analyze this fish catch photo. Identify the species (German name if possible), estimate length_cm and weight_kg, and return a strike_score 0-100 for how notable the catch is. Return JSON.',
            response_json_schema: {
              type: 'object',
              properties: {
                species_detected: { type: 'string' },
                length_cm: { type: 'number' },
                weight_kg: { type: 'number' },
                strike_score: { type: 'number' },
                strike_tips: { type: 'string' },
              },
            },
            file_urls: [urls[0]],
          });
          setAiAnalysis(ai);
          // pre-fill from AI (but don't overwrite if user typed)
          if (ai?.length_cm && length === 55) setLength(Math.round(ai.length_cm));
          if (ai?.weight_kg && weight === 2.4) setWeight(Math.round(ai.weight_kg * 10) / 10);
          // try to pre-select species (case-insensitive match)
          const det = (ai?.species_detected || '').toLowerCase();
          const match = SPECIES.find((s) => det.includes(s.id));
          if (match && !selectedSpeciesId) setSelectedSpeciesId(match.id);
          toast.success(t('upload.ai_detected', { defaultValue: 'KI-Analyse fertig' }));
        } catch {
          toast.error(t('upload.ai_failed', { defaultValue: 'KI-Analyse fehlgeschlagen' }));
        } finally {
          setAiLoading(false);
        }
      }
    } catch (err) {
      toast.error(t('upload.photo_failed', { defaultValue: 'Foto-Upload fehlgeschlagen' }));
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (i) => setUploadedPhotos((prev) => prev.filter((_, idx) => idx !== i));

  // --- GPS + weather ---
  const fetchWeather = async (lat, lon) => {
    setFetchingWeather(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,cloud_cover,surface_pressure,uv_index,visibility&daily=sunrise,sunset&timezone=auto&forecast_days=1`;
      const res = await fetch(url);
      const data = await res.json();
      const cur = data.current || {};
      const daily = data.daily || {};
      setWeather({
        air_temp_c: cur.temperature_2m != null ? Math.round(cur.temperature_2m * 10) / 10 : null,
        wind_speed_kmh: cur.wind_speed_10m != null ? Math.round(cur.wind_speed_10m) : null,
        wind_direction: cur.wind_direction_10m != null ? degToDirection(cur.wind_direction_10m) : null,
        barometric_pressure_hpa: cur.surface_pressure != null ? Math.round(cur.surface_pressure) : null,
        cloud_cover_pct: cur.cloud_cover != null ? Math.round(cur.cloud_cover) : null,
        uv_index: cur.uv_index != null ? Math.round(cur.uv_index * 10) / 10 : null,
        visibility_km: cur.visibility != null ? Math.round((cur.visibility / 1000) * 10) / 10 : null,
        sunrise_time: daily.sunrise?.[0]?.slice(11, 16) || null,
        sunset_time: daily.sunset?.[0]?.slice(11, 16) || null,
        moon_phase: getMoonPhase(),
      });
      toast.success(t('upload.weather_fetched', { defaultValue: 'Wetterdaten erfasst' }));
    } catch {
      toast.error(t('upload.weather_failed', { defaultValue: 'Wetter konnte nicht geladen werden' }));
    } finally {
      setFetchingWeather(false);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('upload.gps_unavailable', { defaultValue: 'GPS nicht verfügbar' }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setGpsLocation(loc);
        toast.success(t('upload.gps_captured', { defaultValue: 'Standort erfasst' }));
        fetchWeather(loc.lat, loc.lon);
      },
      () => toast.error(t('upload.gps_failed', { defaultValue: 'Standort konnte nicht ermittelt werden' }))
    );
  };

  // --- XP calc ---
  const calculateFishXP = ({ length_cm, weight_kg, hasPhoto, hasGps }) => {
    let xp = 10;
    if (length_cm > 30) xp += 5;
    if (length_cm > 50) xp += 10;
    if (weight_kg > 2) xp += 5;
    if (weight_kg > 5) xp += 15;
    if (hasPhoto) xp += 5;
    if (hasGps) xp += 5;
    return xp;
  };

  // --- Submit ---
  const handleSubmit = async () => {
    if (!selectedSpeciesId) {
      toast.error(t('upload.species_required', { defaultValue: 'Bitte Fischart wählen' }));
      setStep(1);
      return;
    }
    if (!gpsLocation) {
      toast.error(t('upload.gps_required', { defaultValue: 'GPS-Standort erforderlich' }));
      return;
    }
    setSaving(true);
    const now = new Date();
    const speciesObj = SPECIES.find((s) => s.id === selectedSpeciesId);
    const speciesName = t(`species.${selectedSpeciesId}`, {
      defaultValue: speciesObj?.id?.charAt(0).toUpperCase() + speciesObj?.id?.slice(1),
    });
    const fishXP = calculateFishXP({
      length_cm: length,
      weight_kg: weight,
      hasPhoto: uploadedPhotos.length > 0,
      hasGps: !!gpsLocation,
    });
    const catchData = {
      species: speciesName,
      length_cm: length,
      weight_kg: weight,
      waterbody,
      caught_date: now.toISOString().slice(0, 10),
      caught_time: now.toTimeString().slice(0, 5),
      photo_urls: uploadedPhotos,
      gps_lat: gpsLocation.lat,
      gps_lon: gpsLocation.lon,
      verification_level: 'gps_verified',
      air_temp_c: weather?.air_temp_c ?? null,
      wind_speed_kmh: weather?.wind_speed_kmh ?? null,
      wind_direction: weather?.wind_direction ?? null,
      barometric_pressure_hpa: weather?.barometric_pressure_hpa ?? null,
      cloud_cover_pct: weather?.cloud_cover_pct ?? null,
      uv_index: weather?.uv_index ?? null,
      visibility_km: weather?.visibility_km ?? null,
      sunrise_time: weather?.sunrise_time ?? null,
      sunset_time: weather?.sunset_time ?? null,
      moon_phase: weather?.moon_phase ?? getMoonPhase(),
      sun_position: getSunPosition(now.getHours()),
      strike_score: aiAnalysis?.strike_score ?? null,
      fish_xp: fishXP,
      hook_points_earned: fishXP,
    };
    try {
      await base44.entities.Catch.create(catchData);
      if (user) {
        try {
          await base44.auth.updateMe({
            total_catches: (user.total_catches || 0) + 1,
            fish_xp: (user.fish_xp || 0) + fishXP,
            hook_points: (user.hook_points || 0) + fishXP,
            biggest_catch_weight: Math.max(user.biggest_catch_weight || 0, weight),
          });
        } catch {
          // non-blocking
        }
      }
      setShowSparks(true);
      toast.success(t('upload.saved', { defaultValue: 'Fang eingetragen!' }));
      setTimeout(() => navigate('/mycatches'), 900);
    } catch (err) {
      toast.error(t('upload.save_failed', { defaultValue: 'Speichern fehlgeschlagen' }));
      setSaving(false);
    }
  };

  const filteredSpecies = SPECIES.filter((s) => {
    const label = t(`species.${s.id}`, { defaultValue: s.id });
    return (
      label.toLowerCase().includes(search.toLowerCase()) ||
      s.latin.toLowerCase().includes(search.toLowerCase())
    );
  });

  const canAdvance = () => {
    if (step === 0) return true; // photo optional
    if (step === 1) return !!selectedSpeciesId;
    if (step === 2) return length > 0 && weight > 0;
    return true;
  };

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4">
        <div className="mb-6">
          <p className="text-foam/50 text-sm">{t('upload.subtitle', { defaultValue: 'Fang dokumentieren' })}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">
            {t('upload.title', { defaultValue: 'Neuer Fang' })}
          </h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1">
                <motion.div
                  animate={i <= step ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step
                      ? 'gradient-tide text-white'
                      : i === step
                      ? 'border-2 border-tide-400 text-tide-400'
                      : 'bg-abyss-700 text-foam/30'
                  }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </motion.div>
                <span
                  className={`text-[9px] font-medium ${i === step ? 'text-tide-400' : 'text-foam/30'}`}
                >
                  {t(`upload.step_${s}`, { defaultValue: s })}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-4 rounded-full overflow-hidden bg-abyss-700">
                  <motion.div
                    className="h-full gradient-tide"
                    animate={{ width: i < step ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: tideEase }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 0 — PHOTO */}
          {step === 0 && (
            <motion.div
              key="s0"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: tideEase }}
              className="space-y-4"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {uploadedPhotos.length === 0 ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-52 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all border-2 border-dashed border-tide-400/30 bg-abyss-800/30"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-10 h-10 text-tide-400 animate-spin" />
                      <p className="text-tide-300 font-medium">
                        {t('upload.uploading', { defaultValue: 'Foto wird hochgeladen...' })}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-tide-500/10 border border-tide-400/20 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-tide-400" />
                      </div>
                      <p className="text-foam font-semibold">
                        {t('upload.take_or_choose', { defaultValue: 'Foto aufnehmen oder wählen' })}
                      </p>
                      <p className="text-foam/30 text-xs">
                        {t('upload.ai_auto_detect', { defaultValue: 'KI erkennt die Fischart automatisch' })}
                      </p>
                    </>
                  )}
                </motion.button>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedPhotos.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden glass-card border border-tide-400/30">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-abyss-900/80 text-foam/80 flex items-center justify-center hover:bg-red-500/60"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="aspect-square rounded-2xl border-2 border-dashed border-tide-400/30 flex items-center justify-center text-tide-400"
                    >
                      {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                    </button>
                  </div>

                  {aiLoading && (
                    <div className="glass-card rounded-2xl p-3 flex items-center gap-3">
                      <Loader2 className="w-4 h-4 text-tide-400 animate-spin" />
                      <p className="text-sm text-foam/70">
                        {t('upload.ai_running', { defaultValue: 'KI analysiert…' })}
                      </p>
                    </div>
                  )}
                  {aiAnalysis && !aiLoading && (
                    <div className="glass-card rounded-2xl p-4 border border-tide-400/20 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-tide-400" />
                        <p className="text-sm font-bold text-foam">
                          {t('upload.ai_result', {
                            species: aiAnalysis.species_detected,
                            defaultValue: 'Erkannt: {{species}}',
                          })}
                        </p>
                      </div>
                      {aiAnalysis.strike_score != null && (
                        <p className="text-xs text-foam/60">
                          🎯 Strike Score: <span className="text-sun-400 font-bold">{aiAnalysis.strike_score}/100</span>
                        </p>
                      )}
                      {aiAnalysis.strike_tips && (
                        <p className="text-xs text-foam/50 leading-relaxed pt-1">{aiAnalysis.strike_tips}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(1)}
                className="w-full py-4 rounded-2xl gradient-tide font-display font-bold text-white glow-tide"
              >
                {aiAnalysis
                  ? t('upload.continue_with_ai', { defaultValue: 'Mit KI-Analyse fortfahren' })
                  : uploadedPhotos.length
                  ? t('common.next', { defaultValue: 'Weiter' })
                  : t('common.skip', { defaultValue: 'Überspringen' })}
              </motion.button>
            </motion.div>
          )}

          {/* STEP 1 — SPECIES */}
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: tideEase }}
              className="space-y-4"
            >
              <div className="glass-card rounded-2xl flex items-center gap-3 px-4 py-3">
                <Search className="w-4 h-4 text-tide-400 flex-shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('upload.search_species', { defaultValue: 'Fischart suchen…' })}
                  className="bg-transparent flex-1 text-foam placeholder-foam/30 text-sm outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {filteredSpecies.map((s) => {
                  const label = t(`species.${s.id}`, {
                    defaultValue: s.id.charAt(0).toUpperCase() + s.id.slice(1),
                  });
                  const active = selectedSpeciesId === s.id;
                  return (
                    <motion.button
                      key={s.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setSelectedSpeciesId(s.id)}
                      className={`p-4 rounded-2xl text-left transition-all ${
                        active ? 'gradient-tide glow-tide' : 'glass-card border border-tide-300/10'
                      }`}
                    >
                      <div className="text-2xl mb-2">{s.emoji}</div>
                      <p className={`font-bold text-sm ${active ? 'text-white' : 'text-foam'}`}>{label}</p>
                      <p className={`text-xs italic ${active ? 'text-white/70' : 'text-foam/30'}`}>
                        {s.latin}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(2)}
                disabled={!selectedSpeciesId}
                className={`w-full py-4 rounded-2xl font-display font-bold text-white transition-all ${
                  selectedSpeciesId ? 'gradient-tide glow-tide' : 'bg-abyss-700 text-foam/30'
                }`}
              >
                {t('common.next', { defaultValue: 'Weiter' })}
              </motion.button>
            </motion.div>
          )}

          {/* STEP 2 — MEASURES */}
          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: tideEase }}
              className="space-y-5"
            >
              {[
                { key: 'length', value: length, setValue: setLength, unit: 'cm', min: 5, max: 200, stepSize: 1 },
                { key: 'weight', value: weight, setValue: setWeight, unit: 'kg', min: 0.1, max: 50, stepSize: 0.1 },
              ].map((sl) => (
                <div key={sl.key} className="glass-card rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-foam font-bold">
                      {t(`upload.${sl.key}`, { defaultValue: sl.key })}
                    </p>
                    <div className="px-3 py-1.5 rounded-xl gradient-tide">
                      <span className="text-white font-display font-bold">
                        {sl.value} {sl.unit}
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={sl.min}
                    max={sl.max}
                    step={sl.stepSize}
                    value={sl.value}
                    onChange={(e) => sl.setValue(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #1FA7B8 0%, #4DC3D1 ${
                        ((sl.value - sl.min) / (sl.max - sl.min)) * 100
                      }%, rgba(10,50,68,0.8) ${
                        ((sl.value - sl.min) / (sl.max - sl.min)) * 100
                      }%, rgba(10,50,68,0.8) 100%)`,
                    }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-foam/30 text-xs">
                      {sl.min} {sl.unit}
                    </span>
                    <span className="text-foam/30 text-xs">
                      {sl.max} {sl.unit}
                    </span>
                  </div>
                </div>
              ))}

              <div className="glass-card rounded-2xl p-4">
                <p className="text-foam/50 text-xs font-medium mb-2">
                  {t('upload.waterbody', { defaultValue: 'Gewässer (optional)' })}
                </p>
                <input
                  value={waterbody}
                  onChange={(e) => setWaterbody(e.target.value)}
                  placeholder={t('upload.waterbody_placeholder', { defaultValue: 'See, Fluss, Meeresspot' })}
                  className="w-full bg-transparent text-foam placeholder-foam/30 text-sm outline-none"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(3)}
                className="w-full py-4 rounded-2xl gradient-tide font-display font-bold text-white glow-tide"
              >
                {t('common.next', { defaultValue: 'Weiter' })}
              </motion.button>
            </motion.div>
          )}

          {/* STEP 3 — LOCATION & WEATHER & SAVE */}
          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: tideEase }}
              className="space-y-4"
            >
              {/* Radar */}
              <div className="h-40 rounded-3xl overflow-hidden relative glass-card">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 50%, rgba(14,64,84,0.8) 0%, rgba(2,21,33,0.95) 100%)',
                  }}
                >
                  {[40, 50, 60, 70, 80].map((r) => (
                    <div
                      key={r}
                      className="absolute rounded-full border border-tide-500/10"
                      style={{
                        width: `${r}%`,
                        height: `${r}%`,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-tide-400"
                    />
                    <div className="w-10 h-10 rounded-full gradient-tide glow-tide flex items-center justify-center relative">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                {gpsLocation && (
                  <div className="absolute bottom-2 left-0 right-0 text-center">
                    <span className="text-[10px] text-foam/60 bg-abyss-900/60 px-2 py-1 rounded-full">
                      📍 {gpsLocation.lat.toFixed(4)}, {gpsLocation.lon.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={getLocation}
                disabled={fetchingWeather}
                className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold transition-all ${
                  gpsLocation
                    ? 'bg-mint-400/10 text-mint-400 border border-mint-400/30'
                    : 'glass-card border border-tide-400/30 text-tide-400'
                }`}
              >
                {fetchingWeather ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                {fetchingWeather
                  ? t('upload.weather_loading', { defaultValue: 'Wetter wird geladen…' })
                  : gpsLocation
                  ? t('upload.gps_ok', { defaultValue: 'GPS + Wetter erfasst' })
                  : t('upload.use_location', { defaultValue: 'Standort & Wetter erfassen' })}
              </motion.button>

              {weather && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {weather.air_temp_c != null && (
                    <StatChip icon={Thermometer} label={`${weather.air_temp_c}°C`} tint="text-sun-400" />
                  )}
                  {weather.wind_speed_kmh != null && (
                    <StatChip
                      icon={Wind}
                      label={`${weather.wind_speed_kmh} km/h ${weather.wind_direction || ''}`}
                      tint="text-tide-400"
                    />
                  )}
                  {weather.barometric_pressure_hpa && (
                    <StatChip icon={Droplets} label={`${weather.barometric_pressure_hpa} hPa`} tint="text-tide-300" />
                  )}
                  {weather.uv_index != null && (
                    <StatChip icon={Sun} label={`UV ${weather.uv_index}`} tint="text-sun-400" />
                  )}
                  {weather.moon_phase && (
                    <StatChip icon={Moon} label={weather.moon_phase} tint="text-foam/70" />
                  )}
                  {weather.sunrise_time && weather.sunset_time && (
                    <StatChip
                      icon={Clock}
                      label={`☀ ${weather.sunrise_time} – ${weather.sunset_time}`}
                      tint="text-foam/70"
                    />
                  )}
                </div>
              )}

              <div className="relative pt-2">
                <SunSparks
                  active={showSparks}
                  onComplete={() => setShowSparks(false)}
                  count={6}
                  originX="50%"
                  originY="50%"
                />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={saving || !gpsLocation || !selectedSpeciesId}
                  className="w-full py-4 rounded-2xl font-display font-bold text-white text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(90deg, #1FA7B8 0%, #F5C34B 100%)',
                    boxShadow: '0 0 28px rgba(245,195,75,0.3)',
                  }}
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Fish className="w-5 h-5" />
                  )}
                  {saving
                    ? t('upload.saving', { defaultValue: 'Wird gespeichert…' })
                    : t('upload.save_catch', { defaultValue: 'Fang speichern' })}{' '}
                  🎣
                </motion.button>
              </div>

              {!gpsLocation && (
                <p className="text-[11px] text-sun-400/80 text-center">
                  ⚠️ {t('upload.gps_hint', { defaultValue: 'Fang muss per GPS verifiziert werden.' })}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="mt-4 text-foam/40 text-sm flex items-center gap-1"
          >
            ← {t('common.back', { defaultValue: 'Zurück' })}
          </button>
        )}
        <div className="h-4" />
      </div>
    </PageTransition>
  );
}

function StatChip({ icon: Icon, label, tint = 'text-foam/70' }) {
  return (
    <div className="glass-card rounded-xl px-3 py-2 flex items-center gap-2">
      <Icon className={`w-3.5 h-3.5 ${tint}`} />
      <span className="text-foam/80 text-xs font-medium">{label}</span>
    </div>
  );
}
