import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload as UploadIcon, MapPin, Loader2, CheckCircle,
  Leaf, Sparkles, Zap, Fish, Clock, Cloud, Anchor, AlertTriangle, Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import { computeTrustScore } from '@/utils/trustEngine';
import { evaluateAchievements, buildRarityMap } from '@/utils/achievementEngine';
import { fetchWithCache, addPendingCatch } from '@/hooks/useOfflineCache';
import * as exifr from 'exifr';

// ---------------- Constants ----------------

const COMMON_BAITS = [
  'Gummifisch', 'Wobbler', 'Spinner', 'Blinker', 'Jig', 'Popper',
  'Crankbait', 'Softbait', 'Fliege', 'Twister', 'Metalljig', 'Streamer',
  'Tauwurm', 'Maden', 'Mais', 'Boilie', 'Köderfisch', 'Sardine', 'Shrimp',
];

const BAIT_BRANDS = [
  'Savage Gear', 'Rapala', 'Mepps', 'Abu Garcia', 'Berkley', 'Daiwa',
  'Shimano', 'Fox', 'Korda', 'Nash', 'Westin', 'Illex', 'Balzer',
  'Cormoran', 'DAM', 'Jenzi', 'Spro', 'Strike Pro', 'Lucky Craft', 'Megabass',
];

const MOON_PHASES = [
  { value: 'Neumond', label_key: 'upload.moon.new', icon: '🌑' },
  { value: 'Zunehmend', label_key: 'upload.moon.waxing', icon: '🌒' },
  { value: 'Halbmond', label_key: 'upload.moon.half', icon: '🌓' },
  { value: 'Vollmond', label_key: 'upload.moon.full', icon: '🌕' },
  { value: 'Abnehmend', label_key: 'upload.moon.waning', icon: '🌖' },
];

const WIND_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

const TIDE_PHASES = [
  { value: 'Auflaufend (Flut)', label_key: 'upload.tide.rising' },
  { value: 'Hochwasser', label_key: 'upload.tide.high' },
  { value: 'Ablaufend (Ebbe)', label_key: 'upload.tide.falling' },
  { value: 'Niedrigwasser', label_key: 'upload.tide.low' },
  { value: 'Gezeitenwechsel', label_key: 'upload.tide.slack' },
];

const SUN_POSITIONS = [
  { value: 'before_sunrise', label_key: 'upload.sun.before_sunrise' },
  { value: 'morning', label_key: 'upload.sun.morning' },
  { value: 'midday', label_key: 'upload.sun.midday' },
  { value: 'afternoon', label_key: 'upload.sun.afternoon' },
  { value: 'evening', label_key: 'upload.sun.evening' },
  { value: 'after_sunset', label_key: 'upload.sun.after_sunset' },
];

// ---------------- Helpers ----------------

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

function calculateFishXP(c) {
  let xp = 10;
  if ((c.length_cm || 0) > 30) xp += 5;
  if ((c.length_cm || 0) > 50) xp += 10;
  if ((c.weight_kg || 0) > 2) xp += 5;
  if ((c.weight_kg || 0) > 5) xp += 15;
  if (c.photo_urls?.length > 0) xp += 5;
  if (c.gps_lat && c.gps_lon) xp += 5;
  if (c.eco_score >= 4) xp += 10;
  return xp;
}

// ---- EXIF & Astronomical helpers ----

async function extractExifData(file) {
  try {
    const data = await exifr.parse(file);
    if (!data) return null;
    const result = {};
    if (data.latitude && data.longitude) {
      result.gps_lat = data.latitude;
      result.gps_lon = data.longitude;
    }
    if (data.DateTimeOriginal) {
      const dt = new Date(data.DateTimeOriginal);
      if (!isNaN(dt)) {
        result.caught_date = dt.toISOString().slice(0, 10);
        result.caught_time = dt.toTimeString().slice(0, 5);
      }
    }
    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}

function calculateMoonPhase(date = new Date()) {
  const known = new Date(2000, 0, 6);
  const diff = (date - known) / (1000 * 60 * 60 * 24);
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

function getSunriseSunset(lat, lon, date = new Date()) {
  const J2000 = 2451545;
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
  const n = jd - J2000 - 0.0008;
  const J = n / 36525;
  const M = 357.52910 + 35999.05029 * J;
  const C = (1.9146 - 0.004817 * J - 0.000014 * J * J) * Math.sin(M * Math.PI / 180) +
            (0.019993 - 0.000101 * J) * Math.sin(2 * M * Math.PI / 180) +
            0.00029 * Math.sin(3 * M * Math.PI / 180);
  const lambda = 280.46646 + 36000.76983 * J + 0.0003032 * J * J + C;
  const epsilon = 23.439291 - 0.0130042 * J - 0.00000016 * J * J + 0.000000504 * J * J * J;
  const alpha = Math.atan2(Math.cos(epsilon * Math.PI / 180) * Math.sin(lambda * Math.PI / 180), Math.cos(lambda * Math.PI / 180)) * 180 / Math.PI;
  const delta = Math.asin(Math.sin(epsilon * Math.PI / 180) * Math.sin(lambda * Math.PI / 180)) * 180 / Math.PI;
  const H = Math.acos(-Math.tan(lat * Math.PI / 180) * Math.tan(delta * Math.PI / 180)) * 180 / Math.PI / 15;
  const ut = 12 + H - alpha / 15 + (lon / 15);
  const sunrise_hours = ((ut - Math.floor(ut)) * 24) % 24;
  const sunset_hours = ((ut + 2 * H - Math.floor(ut + 2 * H)) * 24) % 24;
  const fmt = (h) => {
    const hh = Math.floor(h);
    const mm = Math.floor((h - hh) * 60);
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };
  return { sunrise: fmt(sunrise_hours), sunset: fmt(sunset_hours) };
}

function getSunPositionFromTime(hour) {
  if (hour < 6) return 'before_sunrise';
  if (hour < 10) return 'morning';
  if (hour < 14) return 'midday';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'after_sunset';
}

// Parse "DD-MM" into [day, month] (1-based month)
function parseDDMM(s) {
  if (!s || typeof s !== 'string') return null;
  const [dd, mm] = s.split('-').map(Number);
  if (!Number.isFinite(dd) || !Number.isFinite(mm)) return null;
  return [dd, mm];
}

// Checks whether date (Date obj) falls in [start, end] schonzeit, supporting year-wrap.
function isInSchonzeit(startStr, endStr, date = new Date()) {
  const s = parseDDMM(startStr);
  const e = parseDDMM(endStr);
  if (!s || !e) return false;
  const todayKey = (date.getMonth() + 1) * 100 + date.getDate(); // e.g. 0415
  const sKey = s[1] * 100 + s[0];
  const eKey = e[1] * 100 + e[0];
  if (sKey <= eKey) return todayKey >= sKey && todayKey <= eKey;
  // wraps year boundary (e.g. 01-10 → 28-02)
  return todayKey >= sKey || todayKey <= eKey;
}

// Picks the best Regulation row for a given species + optional country preference
function pickRegulation(regs, species, preferredCountry) {
  if (!species) return null;
  const bySpecies = regs.filter(r => r.species && r.species.toLowerCase() === species.toLowerCase());
  if (!bySpecies.length) return null;
  if (preferredCountry) {
    const countryMatch = bySpecies.find(r => r.country && r.country.toLowerCase() === preferredCountry.toLowerCase());
    if (countryMatch) return countryMatch;
  }
  // fallback: lowest mindestmass row (most lenient) or first
  const withSize = bySpecies.filter(r => r.mindestmass_cm != null);
  if (withSize.length) {
    return withSize.reduce((a, b) => (a.mindestmass_cm <= b.mindestmass_cm ? a : b));
  }
  return bySpecies[0];
}

// ---------------- Component ----------------

export default function Upload() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5);

  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [cleanupPhoto, setCleanupPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzingEco, setAnalyzingEco] = useState(false);
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsValidationError, setGpsValidationError] = useState(null);
  const [ecoAnalysis, setEcoAnalysis] = useState(null);
  const [autoFields, setAutoFields] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [regulations, setRegulations] = useState([]);
  const [allSpecies, setAllSpecies] = useState([]);

  // Load regulations and species once (with offline cache)
  useEffect(() => {
    Promise.all([
      fetchWithCache('regulations', () => base44.entities.Regulation.list('species', 500)),
      fetchWithCache('all_species', () => base44.entities.Species.list('name', 500)),
    ]).then(([regs, species]) => {
      setRegulations(regs || []);
      setAllSpecies((species || []).map(s => s.name || s.name_de || s.name_en).filter(Boolean).sort());
    });
  }, []);

  const urlParams = new URLSearchParams(window.location.search);
  const preselectedSpecies = urlParams.get('species') || '';

  const [formData, setFormData] = useState({
    species: preselectedSpecies,
    length_cm: '',
    weight_kg: '',
    bait: '',
    bait_brand: '',
    waterbody: '',
    description: '',
    caught_date: todayStr,
    caught_time: timeStr,
    air_temp_c: '',
    water_temp_c: '',
    wind_speed_kmh: '',
    wind_direction: '',
    barometric_pressure_hpa: '',
    pressure_trend: '',
    tide_phase: '',
    cloud_cover_pct: '',
    uv_index: '',
    visibility_km: '',
    sunrise_time: '',
    sunset_time: '',
    sun_position: getSunPosition(now.getHours()),
    fishing_depth_m: '',
    moon_phase: getMoonPhase(),
    released: false,
  });

  // Applicable regulation for the current species + user country
  const applicableReg = useMemo(
    () => pickRegulation(regulations, formData.species, user?.country),
    [regulations, formData.species, user?.country],
  );

  // Size + Schonzeit warnings
  const regWarnings = useMemo(() => {
    const out = { tooSmall: false, inSchonzeit: false, minSize: null, sz: null };
    if (!applicableReg) return out;
    const len = parseFloat(formData.length_cm);
    if (applicableReg.mindestmass_cm != null && Number.isFinite(len) && len > 0 && len < applicableReg.mindestmass_cm) {
      out.tooSmall = true;
      out.minSize = applicableReg.mindestmass_cm;
    }
    if (applicableReg.schonzeit_start && applicableReg.schonzeit_end) {
      const d = formData.caught_date ? new Date(formData.caught_date) : new Date();
      if (isInSchonzeit(applicableReg.schonzeit_start, applicableReg.schonzeit_end, d)) {
        out.inSchonzeit = true;
        out.sz = `${applicableReg.schonzeit_start} → ${applicableReg.schonzeit_end}`;
      }
    }
    return out;
  }, [applicableReg, formData.length_cm, formData.caught_date]);

  const set = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));
  const setAuto = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setAutoFields((prev) => ({
      ...prev,
      ...Object.fromEntries(Object.keys(updates).map((k) => [k, true])),
    }));
  };
  
  const handleNumberBlur = (key) => (e) => {
    set(key, e.target.value);
  };

  // ---------- Weather / GPS ----------

  const fetchWeather = async (lat, lon) => {
    setFetchingWeather(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,cloud_cover,surface_pressure,uv_index,visibility&daily=sunrise,sunset&timezone=auto&forecast_days=1`;
      const res = await fetch(url);
      const data = await res.json();
      const cur = data.current || {};
      const daily = data.daily || {};

      const sunrise = daily.sunrise?.[0]?.slice(11, 16) || '';
      const sunset = daily.sunset?.[0]?.slice(11, 16) || '';

      setAuto({
        air_temp_c: cur.temperature_2m != null ? Math.round(cur.temperature_2m * 10) / 10 : '',
        wind_speed_kmh: cur.wind_speed_10m != null ? Math.round(cur.wind_speed_10m) : '',
        wind_direction: cur.wind_direction_10m != null ? degToDirection(cur.wind_direction_10m) : '',
        barometric_pressure_hpa: cur.surface_pressure != null ? Math.round(cur.surface_pressure) : '',
        cloud_cover_pct: cur.cloud_cover != null ? Math.round(cur.cloud_cover) : '',
        uv_index: cur.uv_index != null ? Math.round(cur.uv_index * 10) / 10 : '',
        visibility_km: cur.visibility != null ? Math.round((cur.visibility / 1000) * 10) / 10 : '',
        sunrise_time: sunrise,
        sunset_time: sunset,
        moon_phase: getMoonPhase(),
      });
      toast.success(`🌤️ ${t('upload.weather_fetched')}`);
    } catch {
      toast.error(t('upload.weather_failed'));
    } finally {
      setFetchingWeather(false);
    }
  };

  const checkNearWater = async (lat, lon) => {
    try {
      const query = `[out:json];(way["natural"="water"](around:100,${lat},${lon});way["waterway"](around:100,${lat},${lon});relation["natural"="water"](around:100,${lat},${lon});node["natural"="water"](around:100,${lat},${lon});node["waterway"](around:100,${lat},${lon}););out count;`;
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await res.json();
      const count = data?.elements?.[0]?.tags?.total ?? data?.elements?.length ?? 0;
      return count > 0;
    } catch {
      return true; // fail open if API unreachable
    }
  };

  const getLocation = async () => {
    if (!navigator.geolocation) return toast.error(t('upload.gps_unavailable'));
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        toast.loading(`🌊 ${t('upload.checking_water')}`, { id: 'water-check' });
        const nearWater = await checkNearWater(loc.lat, loc.lon);
        toast.dismiss('water-check');
        if (!nearWater) {
          toast.error(`⚠️ ${t('upload.not_near_water')}`);
          return;
        }
        setGpsLocation(loc);
        setAutoFields((prev) => ({ ...prev, gps: true }));
        toast.success(`📍 ${t('upload.gps_captured')}`);
        await fetchWeather(loc.lat, loc.lon);
      },
      () => toast.error(t('upload.gps_failed')),
    );
  };

  // ---------- AI analysis ----------

  const analyzeEcoScore = async (photoUrl) => {
    setAnalyzingEco(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: 'Analyze this fishing spot photo for environmental cleanliness. Score 1-5. Return JSON: { eco_score: number, litter_detected: string[], eco_notes: string }',
        response_json_schema: {
          type: 'object',
          properties: {
            eco_score: { type: 'number' },
            litter_detected: { type: 'array', items: { type: 'string' } },
            eco_notes: { type: 'string' },
          },
        },
        file_urls: [photoUrl],
      });
      setEcoAnalysis(result);
      toast.success(`🌱 ${t('upload.eco_score')}: ${result.eco_score}/5`);
      return result;
    } catch {
      toast.error(t('upload.eco_failed'));
      return null;
    } finally {
      setAnalyzingEco(false);
    }
  };

  const analyzeStrike = async (photoUrl) => {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: 'Analyze this fish catch photo. Return JSON with the detected species name (German), estimated conditions, a strike score 0-100, and a one-sentence tip. Keep tips under 80 chars. Schema: { species_detected: string, conditions: string, strike_score: number, strike_tips: string }',
        response_json_schema: {
          type: 'object',
          properties: {
            species_detected: { type: 'string' },
            conditions: { type: 'string' },
            strike_score: { type: 'number' },
            strike_tips: { type: 'string' },
          },
        },
        file_urls: [photoUrl],
      });
      if (result.species_detected && !formData.species) {
        set('species', result.species_detected);
      }
      toast.success(`🎯 ${t('upload.strike_score')}: ${result.strike_score}/100`);
      return result;
    } catch {
      return null;
    }
  };

  // ---------- Photo upload ----------

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setGpsValidationError(null);
    try {
      // Extract EXIF from first file
      if (files[0]) {
        const exifData = await extractExifData(files[0]);
        if (exifData) {
          const updates = { ...exifData };
          
          // Validate GPS is near water
          if (exifData.gps_lat && exifData.gps_lon) {
            const nearWater = await checkNearWater(exifData.gps_lat, exifData.gps_lon);
            if (!nearWater) {
              setGpsValidationError(t('upload.not_near_water'));
              toast.error(t('upload.not_near_water'));
              setUploading(false);
              return;
            }
          }
          
          // Calculate astronomical data from EXIF date + GPS
          if (exifData.caught_date) {
            const catchDate = new Date(exifData.caught_date);
            updates.moon_phase = calculateMoonPhase(catchDate);
            
            // Sun position from time
            if (exifData.caught_time) {
              const [hh, mm] = exifData.caught_time.split(':').map(Number);
              updates.sun_position = getSunPositionFromTime(hh + mm / 60);
            }
            
            // Sunrise/sunset from GPS
            if (exifData.gps_lat && exifData.gps_lon) {
              const sunTimes = getSunriseSunset(exifData.gps_lat, exifData.gps_lon, catchDate);
              updates.sunrise_time = sunTimes.sunrise;
              updates.sunset_time = sunTimes.sunset;
              
              // Fetch weather from GPS + date
              try {
                const weatherUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${exifData.gps_lat}&longitude=${exifData.gps_lon}&start_date=${exifData.caught_date}&end_date=${exifData.caught_date}&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,relative_humidity_2m,apparent_temperature&timezone=auto`;
                const wRes = await fetch(weatherUrl);
                if (wRes.ok) {
                  const wData = await wRes.json();
                  if (wData.hourly && exifData.caught_time) {
                    const [hh] = exifData.caught_time.split(':').map(Number);
                    const idx = hh;
                    if (wData.hourly.temperature_2m?.[idx] != null) updates.air_temp_c = Math.round(wData.hourly.temperature_2m[idx] * 10) / 10;
                    if (wData.hourly.wind_speed_10m?.[idx] != null) updates.wind_speed_kmh = Math.round(wData.hourly.wind_speed_10m[idx]);
                    if (wData.hourly.wind_direction_10m?.[idx] != null) updates.wind_direction = degToDirection(wData.hourly.wind_direction_10m[idx]);
                  }
                }
              } catch {
                // Best-effort weather; don't fail if unavailable
              }
            }
          }
          
          setAuto(updates);
          toast.success(`📍 EXIF-Daten gefunden: GPS, Datum, Wetter, Mondphase`);
        }
      }
      
      // Upload all files
      const results = await Promise.all(
        files.map((f) => base44.integrations.Core.UploadFile({ file: f })),
      );
      const urls = results.map((r) => r.file_url);
      setUploadedPhotos((prev) => [...prev, ...urls]);
      if (urls.length > 0) await analyzeStrike(urls[0]);
    } catch {
      toast.error(t('upload.photo_failed'));
    } finally {
      setUploading(false);
    }
  };

  const handleCleanupPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setCleanupPhoto(file_url);
      await analyzeEcoScore(file_url);
    } catch {
      toast.error(t('upload.photo_failed'));
    } finally {
      setUploading(false);
    }
  };

  // ---------- Submit ----------

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.species) return toast.error(t('upload.species_required'));
    if (uploadedPhotos.length === 0) return toast.error(t('upload.photo_required'));
    if (!gpsLocation) return toast.error(t('upload.gps_required'));
    if (gpsValidationError) return toast.error(gpsValidationError);

    // Soft confirm if regulation warning active (non-blocking for C&R intent)
    if ((regWarnings.tooSmall || regWarnings.inSchonzeit) && !formData.released) {
      const proceed = window.confirm(t('upload.reg_confirm_save'));
      if (!proceed) return;
    }

    // Offline: queue the catch and exit early
    if (!navigator.onLine) {
      const offlineData = {
        ...formData,
        photo_urls: uploadedPhotos,
        gps_lat: gpsLocation?.lat || null,
        gps_lon: gpsLocation?.lon || null,
      };
      addPendingCatch(offlineData);
      toast.success('📥 Fang gespeichert — wird hochgeladen sobald du wieder online bist');
      navigate(createPageUrl('Dashboard'));
      return;
    }

    setSubmitting(true);

    const toNum = (v) => {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : null;
    };

    const catchData = {
      ...formData,
      length_cm: toNum(formData.length_cm),
      weight_kg: toNum(formData.weight_kg),
      air_temp_c: toNum(formData.air_temp_c),
      water_temp_c: toNum(formData.water_temp_c),
      wind_speed_kmh: toNum(formData.wind_speed_kmh),
      barometric_pressure_hpa: toNum(formData.barometric_pressure_hpa),
      cloud_cover_pct: toNum(formData.cloud_cover_pct),
      uv_index: toNum(formData.uv_index),
      visibility_km: toNum(formData.visibility_km),
      fishing_depth_m: toNum(formData.fishing_depth_m),
      photo_urls: uploadedPhotos,
      gps_lat: gpsLocation?.lat || null,
      gps_lon: gpsLocation?.lon || null,
      eco_score: ecoAnalysis?.eco_score || null,
      cleanup_photo_url: cleanupPhoto || null,
      litter_detected: ecoAnalysis?.litter_detected || [],
      eco_notes: ecoAnalysis?.eco_notes || null,
    };

    // Run Trust Engine — computes score + level from all fields
    const trust = computeTrustScore(catchData);
    catchData.verification_level = trust.level;
    catchData.verification_score = trust.score;

    const xp = calculateFishXP(catchData);
    catchData.fish_xp = xp;
    catchData.hook_points_earned = xp + (ecoAnalysis?.eco_score >= 4 ? 20 : 0);

    try {
      const createdCatch = await base44.entities.Catch.create(catchData);

      // -------- Achievement evaluation (non-blocking, best-effort) --------
      let bonusXp = 0;
      let bonusHp = 0;
      try {
        const [achievements, earned, priorCatches, speciesList] = await Promise.all([
          base44.entities.Achievement.list('sort_order', 50).catch(() => []),
          base44.entities.UserAchievement.filter({ user_email: user?.email }, '-unlocked_date', 100).catch(() => []),
          base44.entities.Catch.list('-caught_date', 500).catch(() => []),
          base44.entities.Species.list('name', 200).catch(() => []),
        ]);
        const allCatches = [createdCatch, ...priorCatches.filter((c) => c.id !== createdCatch?.id)];
        const rarityBySpecies = buildRarityMap(speciesList);
        const newly = evaluateAchievements({
          user,
          catches: allCatches,
          achievements,
          earned,
          createdCatch,
          rarityBySpecies,
          hasPostedInFeed: false, // first_post is triggered from Feed, not here
        });
        for (const unlock of newly) {
          await base44.entities.UserAchievement.create({
            user_email: user?.email,
            achievement_code: unlock.achievement.code,
            unlocked_date: new Date().toISOString(),
            triggered_by_catch_id: createdCatch?.id,
            progress_value: unlock.progress,
            xp_awarded: unlock.xpAwarded,
            hp_awarded: unlock.hpAwarded,
          }).catch(() => {});
          bonusXp += unlock.xpAwarded || 0;
          bonusHp += unlock.hpAwarded || 0;
          const nameKey = document?.documentElement?.lang === 'de' ? unlock.achievement.name_de : unlock.achievement.name_en;
          toast.success(`🏆 ${t('achievements.unlocked')}: ${nameKey || unlock.achievement.code}`);
        }
      } catch (achErr) {
        console.warn('Achievement evaluation failed:', achErr);
      }
      // --------------------------------------------------------------------

      await base44.auth.updateMe({
        total_catches: (user?.total_catches || 0) + 1,
        fish_xp: (user?.fish_xp || 0) + xp + bonusXp,
        hook_points: (user?.hook_points || 0) + catchData.hook_points_earned + bonusHp,
        biggest_catch_weight: Math.max(user?.biggest_catch_weight || 0, catchData.weight_kg || 0),
        total_cleanups: cleanupPhoto ? (user?.total_cleanups || 0) + 1 : (user?.total_cleanups || 0),
      });
      toast.success(`🎣 ${t('upload.saved')}`);
      navigate(createPageUrl('Statistics'));
    } catch (err) {
      console.error(err);
      toast.error(t('upload.save_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Styles ----------

  const inputCls = 'w-full rounded-xl px-3 py-2 text-sm text-foam outline-none bg-abyss-700/40 border border-tide-300/10 focus:border-tide-400/40 transition-colors placeholder-foam/30';
  const selectCls = `${inputCls} appearance-none`;

  const AutoTag = () => (
    <span
      className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-bold"
      style={{ background: 'rgba(46,224,201,0.12)', color: '#2EE0C9', border: '1px solid rgba(46,224,201,0.22)' }}
    >
      📡 {t('upload.auto')}
    </span>
  );

  const FieldLabel = ({ children, auto }) => (
    <p className="text-[11px] text-foam/50 mb-1 font-medium flex items-center">
      {children}
      {auto && autoFields[auto] ? <AutoTag /> : null}
    </p>
  );

  const SectionCard = ({ icon: Icon, iconClass = 'text-tide-400', title, children, accent }) => (
    <div
      className="glass-card rounded-2xl p-4 space-y-3"
      style={accent ? { background: accent.bg, border: accent.border } : undefined}
    >
      <p className="text-sm font-bold text-foam flex items-center gap-2">
        {Icon ? <Icon className={`w-4 h-4 ${iconClass}`} /> : null}
        {title}
      </p>
      {children}
    </div>
  );

  // ---------- Render ----------

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-28 space-y-4 max-w-xl mx-auto">
        {/* Header */}
        <div>
          <p className="text-foam/50 text-sm">{t('upload.subtitle')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('upload.title')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Fotos */}
          <SectionCard icon={Sparkles} iconClass="text-tide-400" title={`${t('upload.section_photos')} *`}>
            <label
              htmlFor="photo-upload"
              className="flex flex-col items-center justify-center h-28 rounded-xl cursor-pointer transition-all hover:bg-tide-400/5"
              style={{ border: '2px dashed rgba(77,195,209,0.25)', background: 'rgba(77,195,209,0.04)' }}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              {uploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-tide-400" />
              ) : (
                <UploadIcon className="w-8 h-8 text-foam/30" />
              )}
              <p className="text-xs text-foam/40 mt-2">
                {uploading ? t('upload.uploading') : t('upload.photo_hint')}
              </p>
            </label>
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {uploadedPhotos.map((url, i) => (
                  <div key={url} className="relative aspect-square rounded-xl overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center bg-mint-400 border border-white/20">
                      <CheckCircle className="w-3 h-3 text-navy-900" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedPhotos((p) => p.filter((_, j) => j !== i))}
                      className="absolute bottom-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-navy-900/80 text-foam hover:bg-coral-500/80"
                      aria-label="remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* 2. GPS + Auto-Wetter */}
          <SectionCard icon={MapPin} iconClass="text-mint-400" title={t('upload.section_location')}>
            <button
              type="button"
              onClick={getLocation}
              disabled={fetchingWeather}
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              style={
                gpsLocation
                  ? { background: 'rgba(46,224,201,0.12)', color: '#2EE0C9', border: '1px solid rgba(46,224,201,0.3)' }
                  : { background: 'rgba(77,195,209,0.08)', color: '#4DC3D1', border: '1px solid rgba(77,195,209,0.25)' }
              }
            >
              {fetchingWeather ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              {fetchingWeather
                ? t('upload.weather_loading')
                : gpsLocation
                ? `✓ ${t('upload.gps_ok')}`
                : t('upload.gps_capture')}
            </button>
            {gpsLocation && (
              <p className="text-[10px] text-foam/40 text-center">
                📍 {gpsLocation.lat.toFixed(4)}, {gpsLocation.lon.toFixed(4)}
              </p>
            )}
          </SectionCard>

          {/* 3. Fischart + Maße */}
          <SectionCard icon={Fish} iconClass="text-sun-400" title={t('upload.section_species')}>
            <div>
               <FieldLabel>{t('upload.species')} *</FieldLabel>
               <select
                 value={formData.species}
                 onChange={(e) => set('species', e.target.value)}
                 className={selectCls}
               >
                 <option value="">-- {t('upload.species_placeholder')} --</option>
                 {(allSpecies.length > 0 ? allSpecies : ['Hecht', 'Zander', 'Barsch', 'Karpfen']).map((s) => (
                   <option key={s} value={s}>{s}</option>
                 ))}
               </select>
             </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>{t('upload.length_cm')}</FieldLabel>
                <input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  value={formData.length_cm}
                  onChange={(e) => setFormData((prev) => ({ ...prev, length_cm: e.target.value }))}
                  onBlur={handleNumberBlur('length_cm')}
                  placeholder="45"
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel>{t('upload.weight_kg')}</FieldLabel>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData((prev) => ({ ...prev, weight_kg: e.target.value }))}
                  onBlur={handleNumberBlur('weight_kg')}
                  placeholder="2.5"
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel>{t('upload.depth_m')}</FieldLabel>
                <input
                  type="number"
                  step="0.5"
                  inputMode="decimal"
                  value={formData.fishing_depth_m}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fishing_depth_m: e.target.value }))}
                  onBlur={handleNumberBlur('fishing_depth_m')}
                  placeholder="5"
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel>{t('upload.waterbody')}</FieldLabel>
                <input
                  value={formData.waterbody}
                  onChange={(e) => set('waterbody', e.target.value)}
                  placeholder={t('upload.waterbody_placeholder')}
                  className={inputCls}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.released}
                onChange={(e) => set('released', e.target.checked)}
                className="w-4 h-4 accent-mint-400"
              />
              <span className="text-xs text-foam/70">{t('upload.released')}</span>
            </label>

            {applicableReg && (regWarnings.tooSmall || regWarnings.inSchonzeit) && (
              <div
                className="mt-2 rounded-xl p-3 border"
                style={{
                  background: 'rgba(239,92,106,0.08)',
                  borderColor: 'rgba(239,92,106,0.32)',
                }}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-coral-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-coral-300 mb-1">
                      {t('upload.reg_warning_title')}
                    </p>
                    {regWarnings.tooSmall && (
                      <p className="text-foam/80">
                        🐟 {t('upload.reg_too_small', {
                          species: formData.species,
                          min: regWarnings.minSize,
                          region: applicableReg.region || applicableReg.country || '',
                        })}
                      </p>
                    )}
                    {regWarnings.inSchonzeit && (
                      <p className="text-foam/80 mt-1">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {t('upload.reg_schonzeit', {
                          species: formData.species,
                          sz: regWarnings.sz,
                          region: applicableReg.region || applicableReg.country || '',
                        })}
                      </p>
                    )}
                    {applicableReg.source_url && (
                      <a
                        href={applicableReg.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-tide-300 underline text-[11px] mt-1 inline-block"
                      >
                        {t('upload.reg_source')} ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {applicableReg && !regWarnings.tooSmall && !regWarnings.inSchonzeit && applicableReg.mindestmass_cm != null && (
              <div
                className="mt-2 rounded-xl p-2.5 border"
                style={{
                  background: 'rgba(46,224,201,0.06)',
                  borderColor: 'rgba(46,224,201,0.25)',
                }}
              >
                <p className="text-[11px] text-mint-300 flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3" />
                  {t('upload.reg_ok', {
                    min: applicableReg.mindestmass_cm,
                    region: applicableReg.region || applicableReg.country || '',
                  })}
                </p>
              </div>
            )}
          </SectionCard>

          {/* 4. Datum + Uhrzeit */}
          <SectionCard icon={Clock} iconClass="text-tide-400" title={t('upload.section_datetime')}>
            <div className="grid grid-cols-2 gap-3 auto-cols-fr">
              <div className="min-w-0">
                <FieldLabel>{t('upload.date')}</FieldLabel>
                <input
                  type="date"
                  value={formData.caught_date}
                  onChange={(e) => set('caught_date', e.target.value)}
                  className={`${inputCls} w-full`}
                />
              </div>
              <div className="min-w-0">
                <FieldLabel>{t('upload.time')}</FieldLabel>
                <input
                  type="time"
                  value={formData.caught_time}
                  onChange={(e) => set('caught_time', e.target.value)}
                  className={`${inputCls} w-full`}
                />
              </div>
            </div>
          </SectionCard>

          {/* 5. Umweltbedingungen */}
          <SectionCard icon={Cloud} iconClass="text-tide-400" title={t('upload.section_weather')}>
            {Object.keys(autoFields).length > 0 && (
              <span
                className="inline-block text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(46,224,201,0.12)', color: '#2EE0C9' }}
              >
                📡 {t('upload.auto_via_gps')}
              </span>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'air_temp_c', label: t('upload.air_temp'), ph: '20', auto: true },
                { key: 'water_temp_c', label: t('upload.water_temp'), ph: '18' },
                { key: 'wind_speed_kmh', label: t('upload.wind_speed'), ph: '15', auto: true },
                { key: 'barometric_pressure_hpa', label: t('upload.pressure'), ph: '1013', auto: true },
                { key: 'cloud_cover_pct', label: t('upload.cloud_cover'), ph: '40', auto: true },
                { key: 'uv_index', label: t('upload.uv_index'), ph: '5', auto: true },
                { key: 'visibility_km', label: t('upload.visibility'), ph: '10', auto: true },
              ].map(({ key, label, ph, auto }) => (
                <div key={key}>
                  <FieldLabel auto={auto ? key : null}>{label}</FieldLabel>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    value={formData[key]}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                    onBlur={handleNumberBlur(key)}
                    placeholder={ph}
                    className={inputCls}
                  />
                </div>
              ))}
              <div>
                <FieldLabel auto="wind_direction">{t('upload.wind_direction')}</FieldLabel>
                <select
                  value={formData.wind_direction}
                  onChange={(e) => set('wind_direction', e.target.value)}
                  className={selectCls}
                >
                  <option value="">--</option>
                  {WIND_DIRECTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>{t('upload.pressure_trend')}</FieldLabel>
                <select
                  value={formData.pressure_trend}
                  onChange={(e) => set('pressure_trend', e.target.value)}
                  className={selectCls}
                >
                  <option value="">--</option>
                  <option value="rising">↑ {t('upload.rising')}</option>
                  <option value="stable">→ {t('upload.stable')}</option>
                  <option value="falling">↓ {t('upload.falling')}</option>
                </select>
              </div>
              <div>
                <FieldLabel auto="sun_position">{t('upload.sun_position')}</FieldLabel>
                <select
                  value={formData.sun_position}
                  onChange={(e) => set('sun_position', e.target.value)}
                  className={selectCls}
                >
                  {SUN_POSITIONS.map((s) => (
                    <option key={s.value} value={s.value}>{t(s.label_key)}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>{t('upload.tide_phase')}</FieldLabel>
                <select
                  value={formData.tide_phase}
                  onChange={(e) => set('tide_phase', e.target.value)}
                  className={selectCls}
                >
                  <option value="">--</option>
                  {TIDE_PHASES.map((tide) => (
                    <option key={tide.value} value={tide.value}>{t(tide.label_key)}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel auto="sunrise_time">{t('upload.sunrise')}</FieldLabel>
                <input
                  type="time"
                  value={formData.sunrise_time}
                  onChange={(e) => set('sunrise_time', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel auto="sunset_time">{t('upload.sunset')}</FieldLabel>
                <input
                  type="time"
                  value={formData.sunset_time}
                  onChange={(e) => set('sunset_time', e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <FieldLabel auto="moon_phase">{t('upload.moon_phase')}</FieldLabel>
              <div className="flex gap-1.5 flex-wrap">
                {MOON_PHASES.map((mp) => (
                  <button
                    key={mp.value}
                    type="button"
                    onClick={() => set('moon_phase', mp.value)}
                    className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-center transition-all"
                    style={
                      formData.moon_phase === mp.value
                        ? { background: 'rgba(245,195,75,0.18)', border: '1px solid rgba(245,195,75,0.45)', color: '#F5C34B' }
                        : { background: 'rgba(232,240,245,0.05)', border: '1px solid rgba(232,240,245,0.08)', color: 'rgba(232,240,245,0.55)' }
                    }
                  >
                    <span className="text-xl">{mp.icon}</span>
                    <span className="text-[9px] font-medium">{t(mp.label_key)}</span>
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* 6. Köder + Notizen */}
          <SectionCard icon={Anchor} iconClass="text-mint-400" title={t('upload.section_bait')}>
            <div>
              <FieldLabel>{t('upload.bait')}</FieldLabel>
              <select
                value={formData.bait}
                onChange={(e) => set('bait', e.target.value)}
                className={selectCls}
              >
                <option value="">-- {t('upload.bait_placeholder')} --</option>
                {COMMON_BAITS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
               <FieldLabel>{t('upload.bait_brand')}</FieldLabel>
               <input
                 list="bait-brands-list"
                 value={formData.bait_brand}
                 onChange={(e) => set('bait_brand', e.target.value)}
                 placeholder={t('upload.bait_brand_placeholder')}
                 className={inputCls}
               />
               <datalist id="bait-brands-list">
                 {BAIT_BRANDS.map((b) => (
                   <option key={b} value={b} />
                 ))}
               </datalist>
             </div>
            <div>
              <FieldLabel>{t('upload.description')}</FieldLabel>
              <textarea
                value={formData.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder={t('upload.description_placeholder')}
                className={`${inputCls} resize-none`}
                style={{ minHeight: 80 }}
              />
            </div>
          </SectionCard>

          {/* 7. Spot-Cleanup Eco */}
          <SectionCard
            icon={Leaf}
            iconClass="text-mint-400"
            title={t('upload.section_cleanup')}
            accent={{ bg: 'rgba(46,224,201,0.06)', border: '1px solid rgba(46,224,201,0.18)' }}
          >
            <label
              htmlFor="cleanup-upload"
              className="flex flex-col items-center justify-center h-20 rounded-xl cursor-pointer"
              style={{ border: '2px dashed rgba(46,224,201,0.3)', background: 'rgba(46,224,201,0.04)' }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleCleanupPhoto}
                className="hidden"
                id="cleanup-upload"
              />
              {analyzingEco ? (
                <Loader2 className="w-6 h-6 animate-spin text-mint-400" />
              ) : (
                <Leaf className="w-6 h-6 text-mint-400" />
              )}
              <p className="text-xs text-mint-400 mt-1">{t('upload.cleanup_hint')}</p>
            </label>
            {ecoAnalysis && (
              <div
                className="flex items-center gap-2 rounded-xl p-2.5"
                style={{ background: 'rgba(46,224,201,0.08)' }}
              >
                <span className="text-lg">{ecoAnalysis.eco_score >= 4 ? '🌟' : '🌿'}</span>
                <div>
                  <p className="text-xs font-bold text-mint-400">
                    {t('upload.eco_score')}: {ecoAnalysis.eco_score}/5
                  </p>
                  <p className="text-[10px] text-foam/50">{ecoAnalysis.eco_notes}</p>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Submit actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="flex-1 py-3 rounded-2xl text-sm font-bold"
              style={{ background: 'rgba(232,240,245,0.06)', color: 'rgba(232,240,245,0.6)' }}
            >
              {t('upload.cancel')}
            </button>
            <motion.button
              type="submit"
              disabled={submitting}
              whileTap={{ scale: 0.97 }}
              className="flex-1 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 text-navy-900 disabled:opacity-60"
              style={{
                background: 'linear-gradient(225deg, #B6F03C 0%, #2EE0C9 55%, #2DA8FF 100%)',
                boxShadow: '0 10px 28px rgba(46,224,201,0.35)',
              }}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {submitting ? t('upload.saving') : t('upload.save_catch')}
            </motion.button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}