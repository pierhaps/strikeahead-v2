import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ReferenceLine, Tooltip, ResponsiveContainer } from 'recharts';
import { Anchor, Clock, Fish, Loader2, Moon, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/ui/PageTransition';
import PremiumGate from '../components/PremiumGate';
import { useLanguageContext } from '../hooks/useLanguage';

const FEATURE_LABELS = { de: "Gezeiten & Marine Intelligence", en: "Tide & Marine Intelligence", es: "Mareas e Inteligencia Marina", fr: "Marées et Intelligence Marine", it: "Maree e Intelligence Marina", nl: "Getijden & Marine Intelligentie", tr: "Gelgit & Deniz İstihbaratı", hr: "Plima i Morska Inteligencija", pt: "Marés e Inteligência Marinha", el: "Παλίρροιες & Θαλάσσια Πληροφορία", ru: "Приливы & Морская Разведка" };

const tideEase = [0.2, 0.8, 0.2, 1];

// Default coast presets — coordinates are a representative mid-point, used when
// the user hasn't granted geolocation. Keys map to i18n labels in tide.coast_*.
const COAST_PRESETS = [
  { key: 'nordsee',    labelKey: 'tide.coast_nordsee',    lat: 54.5, lon: 8.0,  tidal: true  },
  { key: 'ostsee',     labelKey: 'tide.coast_ostsee',     lat: 54.3, lon: 12.7, tidal: false },
  { key: 'atlantik',   labelKey: 'tide.coast_atlantik',   lat: 46.8, lon: -2.2, tidal: true  },
  { key: 'mittelmeer', labelKey: 'tide.coast_mittelmeer', lat: 43.3, lon: 5.4,  tidal: false },
];

// Astronomical moon phase — good enough for UI, accurate to a few hours.
// Returns { phase: 0..1, name: 'new'|'waxing_crescent'|... , illumination: 0..1 }
function computeMoonPhase(date = new Date()) {
  const synodic = 29.530588853;
  // Julian Day
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60) / 24;
  let y = year;
  let m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
  // Reference new moon: 2000-01-06 18:14 UTC (JD 2451550.26)
  const phase = ((jd - 2451550.26) / synodic) % 1;
  const norm = phase < 0 ? phase + 1 : phase;
  const illum = 0.5 * (1 - Math.cos(2 * Math.PI * norm));
  let name = 'new';
  if (norm < 0.03 || norm > 0.97) name = 'new';
  else if (norm < 0.22) name = 'waxing_crescent';
  else if (norm < 0.28) name = 'first_quarter';
  else if (norm < 0.47) name = 'waxing_gibbous';
  else if (norm < 0.53) name = 'full';
  else if (norm < 0.72) name = 'waning_gibbous';
  else if (norm < 0.78) name = 'last_quarter';
  else name = 'waning_crescent';
  return { phase: norm, name, illumination: illum };
}

async function fetchMarineTide(lat, lon) {
  // Open-Meteo Marine API — returns hourly sea_level_height_msl for today.
  const today = new Date().toISOString().split('T')[0];
  const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=sea_level_height_msl&start_date=${today}&end_date=${today}&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('marine api ' + res.status);
  const data = await res.json();
  const times = data?.hourly?.time || [];
  const heights = data?.hourly?.sea_level_height_msl || [];
  if (!times.length || !heights.length) throw new Error('empty marine response');
  return times.map((t, i) => ({
    time: parseFloat(t.slice(11, 13)) + parseFloat(t.slice(14, 16)) / 60,
    label: t.slice(11, 16),
    height: heights[i] ?? 0,
  })).filter((p) => typeof p.height === 'number');
}

function findTurnPoints(data) {
  // A turn point is a local min/max in the tide curve — that's when fish bite hardest.
  const windows = [];
  for (let i = 1; i < data.length - 1; i++) {
    const prev = data[i - 1].height;
    const cur = data[i].height;
    const next = data[i + 1].height;
    if ((cur > prev && cur > next) || (cur < prev && cur < next)) {
      const type = cur > prev ? 'high' : 'low';
      // Score: bigger amplitude → higher score (0-100)
      const amplitude = Math.abs(cur);
      const score = Math.min(95, 55 + Math.round(amplitude * 10));
      const fmt = (idx) => data[idx]?.label || '';
      windows.push({
        type,
        label: `${fmt(Math.max(0, i - 1))} – ${fmt(Math.min(data.length - 1, i + 1))}`,
        score,
        height: cur,
      });
    }
  }
  return windows;
}

function TideTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs border border-tide-300/20">
      <p className="text-tide-400 font-bold">{payload[0].payload.label}</p>
      <p className="text-foam">{payload[0].value > 0 ? '+' : ''}{Number(payload[0].value).toFixed(2)} m</p>
    </div>
  );
}

export default function TideCatch() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'de').split('-')[0];
  const [coast, setCoast] = useState('nordsee');
  const [tideData, setTideData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userCoords, setUserCoords] = useState(null);

  // Try to use user's location for a more accurate reading
  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setUserCoords(null),
      { maximumAge: 5 * 60_000, timeout: 5000 },
    );
  }, []);

  const coastCfg = useMemo(() => COAST_PRESETS.find((c) => c.key === coast) || COAST_PRESETS[0], [coast]);
  const { lat, lon } = useMemo(() => userCoords || { lat: coastCfg.lat, lon: coastCfg.lon }, [userCoords, coastCfg]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchMarineTide(lat, lon)
      .then((data) => { if (!cancelled) setTideData(data); })
      .catch((e) => { if (!cancelled) { setError(e.message); setTideData([]); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [lat, lon]);

  const windows = useMemo(() => findTurnPoints(tideData), [tideData]);
  const moon = useMemo(() => computeMoonPhase(), []);

  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const currentTide = tideData.find((d) => Math.abs(d.time - currentHour) < 0.6)?.height ?? 0;
  const direction = useMemo(() => {
    if (!tideData.length) return 0;
    const idx = tideData.findIndex((d) => Math.abs(d.time - currentHour) < 0.6);
    if (idx < 1 || idx >= tideData.length - 1) return 0;
    return Math.sign(tideData[idx + 1].height - tideData[idx - 1].height);
  }, [tideData, currentHour]);

  return (
    <PremiumGate feature={FEATURE_LABELS[lang] || FEATURE_LABELS.en}>
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-5">
        <div>
          <p className="text-foam/50 text-sm">{t('tide.subtitle')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('tide.title')}</h1>
          {userCoords && (
            <p className="text-tide-400/70 text-xs mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {t('tide.using_your_location')}
            </p>
          )}
        </div>

        {/* Coast selector — only shown when we don't have user location */}
        {!userCoords && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {COAST_PRESETS.map((c) => (
              <button key={c.key} onClick={() => setCoast(c.key)}
                className={`px-4 py-2.5 rounded-2xl text-sm font-bold flex-shrink-0 transition-all ${coast === c.key ? 'gradient-tide text-white glow-tide' : 'glass-card text-foam/60'}`}>
                {t(c.labelKey)}
              </button>
            ))}
          </div>
        )}

        {/* Current status */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between"
          style={{ border: '1px solid rgba(31,167,184,0.2)' }}>
          <div>
            <p className="text-foam/40 text-xs uppercase tracking-widest">{t('tide.now')}</p>
            <p className="font-display font-extrabold text-foam text-2xl">{currentTide >= 0 ? '+' : ''}{currentTide.toFixed(2)} m</p>
            <p className="text-foam/50 text-xs">
              {direction > 0 ? `↗ ${t('tide.rising')}` : direction < 0 ? `↘ ${t('tide.falling')}` : `→ ${t('tide.steady')}`}
            </p>
          </div>
          <div className="text-right">
            <Anchor className="w-8 h-8 text-tide-400 mb-1" />
            <p className="text-tide-400 text-xs font-bold">{userCoords ? t('tide.local') : t(coastCfg.labelKey)}</p>
          </div>
        </div>

        {/* Tide curve */}
        <div className="glass-card rounded-3xl p-4">
          <p className="font-display font-bold text-foam text-sm mb-4">{t('tide.curve_24h')}</p>
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-tide-400 animate-spin" />
            </div>
          ) : error || tideData.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center text-foam/50 text-sm gap-1">
              <p>{t('tide.no_data_title')}</p>
              <p className="text-xs text-foam/40">{t('tide.no_data_sub')}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={tideData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tideGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1FA7B8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1FA7B8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: 'rgba(234,248,250,0.3)', fontSize: 9 }} axisLine={false} tickLine={false}
                  interval={3} />
                <YAxis tick={{ fill: 'rgba(234,248,250,0.3)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<TideTooltip />} />
                <ReferenceLine y={0} stroke="rgba(127,220,229,0.3)" strokeDasharray="4 4" />
                <ReferenceLine x={tideData.find((d) => Math.abs(d.time - currentHour) < 0.6)?.label}
                  stroke="#F5C34B" strokeWidth={2} label={{ value: t('tide.now'), fill: '#F5C34B', fontSize: 9 }} />
                <Area type="monotone" dataKey="height" stroke="#1FA7B8" strokeWidth={2.5}
                  fill="url(#tideGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Moon phase card */}
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center relative overflow-hidden"
            style={{ background: 'rgba(253,230,138,0.08)', border: '1px solid rgba(253,230,138,0.2)' }}>
            <Moon className="w-7 h-7 text-sun-400" />
            <div className="absolute inset-0 rounded-full"
              style={{ background: `linear-gradient(90deg, transparent ${(1 - moon.illumination) * 100}%, rgba(0,0,0,0.55) ${(1 - moon.illumination) * 100}%)` }} />
          </div>
          <div className="flex-1">
            <p className="text-foam/40 text-xs uppercase tracking-widest">{t('tide.moon_phase')}</p>
            <p className="font-display font-bold text-foam text-base">{t(`tide.moon_${moon.name}`)}</p>
            <p className="text-foam/40 text-xs">{Math.round(moon.illumination * 100)}% {t('tide.moon_illumination')}</p>
          </div>
        </div>

        {/* Optimal windows */}
        <div>
          <p className="text-foam/50 text-xs uppercase tracking-widest mb-3">{t('tide.optimal_windows')}</p>
          {windows.length === 0 ? (
            <div className="glass-card rounded-2xl p-6 text-center text-foam/40 text-sm">
              {t('tide.no_turns')}
            </div>
          ) : (
            <div className="space-y-2">
              {windows.map((w, i) => (
                <motion.div key={`${w.type}-${i}-${w.label}`}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="glass-card rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: w.type === 'high' ? 'rgba(31,167,184,0.15)' : 'rgba(245,195,75,0.12)' }}>
                    {w.type === 'high' ? '↗' : '↘'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-foam/40" />
                      <span className="text-foam font-semibold text-sm">{w.label}</span>
                    </div>
                    <p className="text-foam/40 text-xs mt-0.5">
                      {w.type === 'high' ? t('tide.high_tide') : t('tide.low_tide')} · {t('tide.bite_window')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display font-bold text-sun-400 text-lg">{w.score}</p>
                    <p className="text-foam/30 text-[10px]">{t('tide.score')}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Info card */}
        <div className="glass-card rounded-2xl p-4 flex items-start gap-3"
          style={{ border: '1px solid rgba(245,195,75,0.15)' }}>
          <Fish className="w-5 h-5 text-sun-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-foam font-semibold text-sm mb-1">{t('tide.why_turns_title')}</p>
            <p className="text-foam/50 text-xs leading-relaxed">
              {t('tide.why_turns_body')}
            </p>
          </div>
        </div>

        <p className="text-foam/30 text-xs text-center">{t('tide.source')}</p>

        <div className="h-4" />
      </div>
    </PageTransition>
    </PremiumGate>
  );
}