import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Fish, Anchor, Trophy, Target, ChevronRight, Sparkles, Zap,
  Wind, Waves, Thermometer, MapPin, Navigation, Moon, Sun,
  Sunrise, Sunset, CloudRain, Gauge, Droplets, Eye,
  TrendingUp, Calendar, Clock, Compass, ArrowUpRight,
} from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';
import { computeTrustScore, aggregateTrust } from '../utils/trustEngine';
import { recommendBaits, getTimeOfDay, todaysHotSpecies } from '../utils/baitIntelligence';
import logoCircle from '../assets/logo-circle.svg';
import WelcomeHeader from '../components/home/WelcomeHeader';
import InsightBar from '../components/home/InsightBar';
import { SkeletonInsight, SkeletonStats, FadeIn } from '@/components/shared/Skeleton';
import { fetchWithCache } from '@/hooks/useOfflineCache';

const tideEase = [0.2, 0.8, 0.2, 1];
const LOGO_SIZE = 252;      // logo element size (was 210, +20%)
const SIZE = LOGO_SIZE + 28; // gauge ring sits right on logo edge
const CENTER = SIZE / 2;
const GAUGE_R = LOGO_SIZE / 2; // ring exactly on logo border
const GAUGE_STROKE = 10;
const GAUGE_CIRC = 2 * Math.PI * GAUGE_R;

/* ------------------------------------------------------------------ */
/*  Solunar-based Strike Timer                                        */
/* ------------------------------------------------------------------ */
function getStrikeData() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const mins = h * 60 + m;

  // Solunar-inspired feeding windows (hh:mm → minutes)
  const windows = [
    { s: 300, e: 420, type: 'major' },   // 05:00 – 07:00
    { s: 660, e: 720, type: 'minor' },   // 11:00 – 12:00
    { s: 1020, e: 1140, type: 'major' }, // 17:00 – 19:00
    { s: 1380, e: 1440, type: 'minor' }, // 23:00 – 24:00
  ];

  for (const w of windows) {
    if (mins >= w.s && mins < w.e) {
      const remaining = w.e - mins;
      const duration = w.e - w.s;
      return { active: true, type: w.type, minutes: remaining, progress: 1 - remaining / duration };
    }
  }

  let next = null;
  for (const w of windows) {
    if (w.s > mins) { next = w; break; }
  }
  if (!next) next = windows[0]; // wrap to tomorrow

  const until = next.s > mins ? next.s - mins : (1440 - mins) + next.s;
  // Progress toward next window: map 0→1 across the gap between last window end and next start
  const prevEnd = windows.reduce((acc, w) => (w.e <= mins ? w.e : acc), 0) || 0;
  const gap = next.s > prevEnd ? next.s - prevEnd : (1440 - prevEnd) + next.s;
  const elapsed = gap > 0 ? (gap - until) / gap : 0;

  return { active: false, type: next.type, minutes: until, progress: Math.max(0, Math.min(1, elapsed)) };
}

function formatTimer(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ */
/*  Simulated conditions (in a real app, from a weather API)          */
/* ------------------------------------------------------------------ */
function getConditions() {
  const h = new Date().getHours();
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const dir = dirs[Math.floor((h * 3.7) % 8)];
  const speed = 3 + Math.round(Math.sin(h * 0.5) * 4);
  const temp = Math.round(14 + Math.sin(h * 0.26) * 8);
  const tidePhase = h < 6 ? 'falling' : h < 12 ? 'rising' : h < 18 ? 'falling' : 'rising';
  const tideHeight = (Math.sin(h * 0.52) * 0.5 + 0.3).toFixed(1);
  return { windDir: dir, windSpeed: speed, temp, tidePhase, tideHeight };
}

/* ------------------------------------------------------------------ */
/*  Solunar / Astro Data (simulated)                                  */
/* ------------------------------------------------------------------ */
function getSolunarData() {
  const now = new Date();
  const h = now.getHours();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);

  // Moon phase (0-29.5 day cycle)
  const lunarAge = (dayOfYear * 1.03) % 29.5;
  const moonPhase = lunarAge < 1.85 ? 'new' : lunarAge < 7.38 ? 'waxing_crescent' :
    lunarAge < 9.23 ? 'first_quarter' : lunarAge < 14.77 ? 'waxing_gibbous' :
    lunarAge < 16.61 ? 'full' : lunarAge < 22.15 ? 'waning_gibbous' :
    lunarAge < 23.99 ? 'last_quarter' : 'waning_crescent';
  const moonIllum = Math.round(Math.abs(Math.cos(lunarAge / 29.5 * Math.PI * 2)) * 100);

  // Sunrise/sunset (approximate for Central Europe)
  const sunrise = `${5 + Math.round(Math.cos((dayOfYear - 172) / 365 * Math.PI * 2) * 1.5)}:${String(Math.round(Math.abs(Math.sin(dayOfYear * 0.1)) * 50)).padStart(2, '0')}`;
  const sunset = `${20 - Math.round(Math.cos((dayOfYear - 172) / 365 * Math.PI * 2) * 2)}:${String(Math.round(Math.abs(Math.cos(dayOfYear * 0.1)) * 45)).padStart(2, '0')}`;

  // Barometric pressure
  const pressure = Math.round(1013 + Math.sin(h * 0.3 + dayOfYear * 0.1) * 12);
  const pressureTrend = Math.sin(h * 0.3 + dayOfYear * 0.1) > Math.sin((h - 1) * 0.3 + dayOfYear * 0.1) ? 'rising' : 'falling';

  // Water temperature (slightly cooler than air)
  const waterTemp = Math.round(11 + Math.sin(h * 0.26) * 5);

  // Bite probability (composite score)
  const moonScore = moonPhase === 'new' || moonPhase === 'full' ? 90 : moonPhase.includes('quarter') ? 70 : 50;
  const pressureScore = pressure < 1010 ? 85 : pressure > 1020 ? 40 : 65;
  const timeScore = (h >= 5 && h <= 8) || (h >= 17 && h <= 20) ? 90 : (h >= 10 && h <= 14) ? 30 : 55;
  const biteProbability = Math.round((moonScore * 0.3 + pressureScore * 0.35 + timeScore * 0.35));

  return {
    moonPhase, moonIllum, sunrise, sunset, pressure, pressureTrend,
    waterTemp, biteProbability, lunarAge,
  };
}

/* ------------------------------------------------------------------ */
/*  Simulated nearby hotspots                                         */
/* ------------------------------------------------------------------ */
function getNearbySpots() {
  return [
    { name: 'Alster Süd', dist: '1.2 km', species: 'Hecht, Barsch', score: 87, trend: 'up' },
    { name: 'Elbe Hafen', dist: '3.4 km', species: 'Zander, Aal', score: 72, trend: 'up' },
    { name: 'Mühlenteich', dist: '5.1 km', species: 'Karpfen, Schleie', score: 64, trend: 'down' },
  ];
}

/* ------------------------------------------------------------------ */
/*  Bite Probability Gauge — animated radial                          */
/* ------------------------------------------------------------------ */
function BiteGauge({ probability }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = circ * (probability / 100);
  const color = probability >= 75 ? '#B6F03C' : probability >= 50 ? '#2EE0C9' : probability >= 30 ? '#2DA8FF' : '#6B8AA8';

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg width={80} height={80} viewBox="0 0 80 80" className="absolute">
        <circle cx={40} cy={40} r={r} fill="none" stroke="rgba(232,240,245,0.06)" strokeWidth={5} />
        <motion.circle
          cx={40} cy={40} r={r}
          fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.8, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <motion.span
        className="font-display font-black text-lg"
        style={{ color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {probability}%
      </motion.span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Moon Phase Visual                                                  */
/* ------------------------------------------------------------------ */
function MoonVisual({ phase, illumination }) {
  return (
    <motion.div
      className="relative w-12 h-12 rounded-full overflow-hidden"
      animate={{
        boxShadow: [
          '0 0 12px rgba(232,240,245,0.15), 0 0 24px rgba(232,240,245,0.05)',
          '0 0 20px rgba(232,240,245,0.3), 0 0 40px rgba(232,240,245,0.1)',
          '0 0 12px rgba(232,240,245,0.15), 0 0 24px rgba(232,240,245,0.05)',
        ],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="w-full h-full rounded-full"
        style={{
          background: `linear-gradient(90deg, #E8F0F5 ${illumination}%, rgba(14,30,48,0.9) ${illumination}%)`,
        }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Spot Card                                                          */
/* ------------------------------------------------------------------ */
function SpotCard({ spot, index, t }) {
  const scoreColor = spot.score >= 75 ? '#B6F03C' : spot.score >= 50 ? '#2EE0C9' : '#2DA8FF';
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex-shrink-0 w-48 liquid-glass rounded-2xl p-3 relative overflow-hidden"
    >
      {/* Score badge */}
      <motion.div
        className="absolute top-2 right-2 rounded-lg px-2 py-0.5 font-display font-bold text-xs"
        style={{ background: `${scoreColor}20`, color: scoreColor }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {spot.score}
        {spot.trend === 'up' && <ArrowUpRight className="w-3 h-3 inline ml-0.5 -mt-0.5" />}
      </motion.div>

      <div className="flex items-center gap-1.5 mb-2">
        <Navigation className="w-3.5 h-3.5 text-tide-400" />
        <p className="font-display font-bold text-foam text-sm truncate">{spot.name}</p>
      </div>
      <p className="text-foam/40 text-[10px] mb-1">{spot.dist}</p>
      <p className="text-foam/50 text-[11px]">{spot.species}</p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity Tip Card                                                  */
/* ------------------------------------------------------------------ */
function getTips(solunar, conditions) {
  const tips = [];
  if (solunar.biteProbability >= 70) tips.push({ icon: Zap, text: 'tip_high_bite', color: '#B6F03C' });
  if (solunar.pressureTrend === 'falling') tips.push({ icon: Gauge, text: 'tip_pressure_drop', color: '#2EE0C9' });
  if (solunar.moonPhase === 'full' || solunar.moonPhase === 'new') tips.push({ icon: Moon, text: 'tip_moon_peak', color: '#E8F0F5' });
  if (conditions.windSpeed > 5) tips.push({ icon: Wind, text: 'tip_windy', color: '#2DA8FF' });
  if (solunar.waterTemp < 10) tips.push({ icon: Thermometer, text: 'tip_cold_water', color: '#0EBDD8' });
  if (tips.length === 0) tips.push({ icon: Fish, text: 'tip_default', color: '#2EE0C9' });
  return tips;
}

/* ------------------------------------------------------------------ */
/*  Animated number counter                                           */
/* ------------------------------------------------------------------ */
function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!Number.isFinite(value) || value <= 0) { setDisplay(0); return; }
    let start = 0;
    const step = Math.max(1, Math.ceil(value / 40));
    const timer = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplay(start);
      if (start >= value) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}{suffix}</span>;
}

/* ------------------------------------------------------------------ */
/*  SVG Circular Gauge                                                */
/* ------------------------------------------------------------------ */
function StrikeGauge({ progress, active, minutes, type }) {
  const { t } = useTranslation();
  const dashOffset = GAUGE_CIRC * (1 - progress);

  // Clock hand angle: minutes of current hour mapped to 360°
  const now = new Date();
  const handAngle = ((now.getMinutes() * 60 + now.getSeconds()) / 3600) * 360;

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      {/* Ambient glow behind gauge */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: SIZE - 20, height: SIZE - 20,
          background: active
            ? 'radial-gradient(circle, rgba(46,224,201,0.25), transparent 70%)'
            : 'radial-gradient(circle, rgba(45,168,255,0.18), transparent 70%)',
          filter: 'blur(35px)',
        }}
        animate={active ? { scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Inner radar/dark texture circle */}
      <div
        className="absolute rounded-full"
        style={{
          width: GAUGE_R * 2 - GAUGE_STROKE - 8,
          height: GAUGE_R * 2 - GAUGE_STROKE - 8,
          background: 'radial-gradient(circle at 40% 35%, rgba(10,50,68,0.6) 0%, rgba(2,21,33,0.85) 70%)',
          border: '1px solid rgba(46,224,201,0.08)',
        }}
      >
        {/* Radar grid lines inside */}
        <svg width="100%" height="100%" viewBox="0 0 240 240" className="absolute inset-0 opacity-20">
          {[40, 80, 120].map(r => (
            <circle key={r} cx={120} cy={120} r={r} fill="none" stroke="rgba(46,224,201,0.3)" strokeWidth="0.5" />
          ))}
          <line x1={120} y1={0} x2={120} y2={240} stroke="rgba(46,224,201,0.2)" strokeWidth="0.5" />
          <line x1={0} y1={120} x2={240} y2={120} stroke="rgba(46,224,201,0.2)" strokeWidth="0.5" />
          <line x1={30} y1={30} x2={210} y2={210} stroke="rgba(46,224,201,0.1)" strokeWidth="0.5" />
          <line x1={210} y1={30} x2={30} y2={210} stroke="rgba(46,224,201,0.1)" strokeWidth="0.5" />
        </svg>
      </div>

      {/* SVG gauge ring */}
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute">
        <defs>
          <linearGradient id="gauge-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2580C3" />
            <stop offset="30%" stopColor="#0EBDD8" />
            <stop offset="60%" stopColor="#2EE0C9" />
            <stop offset="85%" stopColor="#8BE752" />
            <stop offset="100%" stopColor="#B7F347" />
          </linearGradient>
          <filter id="arc-glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track (subtle) */}
        <circle
          cx={CENTER} cy={CENTER} r={GAUGE_R}
          fill="none"
          stroke="rgba(232,240,245,0.05)"
          strokeWidth={GAUGE_STROKE}
        />

        {/* Animated progress arc */}
        <motion.circle
          cx={CENTER} cy={CENTER} r={GAUGE_R}
          fill="none"
          stroke="url(#gauge-grad)"
          strokeWidth={GAUGE_STROKE}
          strokeLinecap="round"
          strokeDasharray={GAUGE_CIRC}
          initial={{ strokeDashoffset: GAUGE_CIRC }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 2, ease: tideEase }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          filter="url(#arc-glow)"
        />

        {/* White clock hand / needle — like in the reference */}
        <motion.line
          x1={CENTER}
          y1={CENTER}
          x2={CENTER}
          y2={CENTER - GAUGE_R + 20}
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
          initial={{ rotate: 0 }}
          animate={{ rotate: handAngle }}
          transition={{ duration: 1.5, ease: tideEase }}
          filter="url(#arc-glow)"
        />
        {/* Needle center dot */}
        <circle cx={CENTER} cy={CENTER} r={4} fill="white" opacity={0.9} />
      </svg>

      {/* Logo — fills the gauge ring exactly */}
      <div className="absolute z-10 flex items-center justify-center">
        {/* White glow layer (pulsing) */}
        <motion.div
          className="absolute"
          animate={{
            filter: [
              'drop-shadow(0 0 12px rgba(255,255,255,0.2)) drop-shadow(0 0 30px rgba(255,255,255,0.1))',
              'drop-shadow(0 0 24px rgba(255,255,255,0.5)) drop-shadow(0 0 56px rgba(255,255,255,0.2))',
              'drop-shadow(0 0 12px rgba(255,255,255,0.2)) drop-shadow(0 0 30px rgba(255,255,255,0.1))',
            ],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img src={logoCircle} alt="" style={{ width: LOGO_SIZE, height: LOGO_SIZE }} className="object-contain" />
        </motion.div>
        {/* Crisp logo on top */}
        <img src={logoCircle} alt="StrikeAhead" style={{ width: LOGO_SIZE, height: LOGO_SIZE }} className="relative object-contain" />
      </div>

      {/* Timer value — centered inside the logo */}
      <div className="absolute z-20 flex flex-col items-center justify-center" style={{ width: LOGO_SIZE, height: LOGO_SIZE }}>
        {/* Top label */}
        <p className="text-foam/50 text-[10px] font-semibold uppercase tracking-[0.22em] mb-1">
          {active ? t('home.strike_active', { defaultValue: 'Strike Active' }) : t('home.strike_timer', { defaultValue: 'Strike Timer' })}
        </p>

        {/* Big countdown */}
        <p
          className="font-display font-black leading-none"
          style={{
            fontSize: 48,
            letterSpacing: 2,
            color: active ? '#2EE0C9' : '#E8F0F5',
            textShadow: active
              ? '0 0 24px rgba(46,224,201,0.6), 0 2px 12px rgba(0,0,0,0.5)'
              : '0 0 16px rgba(255,255,255,0.15), 0 2px 12px rgba(0,0,0,0.5)',
          }}
        >
          {formatTimer(minutes)}
        </p>

        {/* Subtitle */}
        <p className="text-foam/35 text-[9px] uppercase tracking-[0.18em] mt-1"
           style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
          {active
            ? t('home.strike_remaining', { defaultValue: 'remaining' })
            : (type === 'major'
              ? t('home.strike_until_major', { defaultValue: 'until major bite' })
              : t('home.strike_until_minor', { defaultValue: 'until minor bite' }))}
        </p>
      </div>

      {/* Orbiting glow orb on the gauge arc — smooth circle, color-cycling */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 44,
          height: 44,
          filter: 'blur(6px)',
          top: CENTER - GAUGE_R - 22,
          left: CENTER - 22,
          transformOrigin: `22px ${GAUGE_R + 22}px`,
        }}
        animate={{
          rotate: [0, 360],
          background: [
            'radial-gradient(circle, rgba(37,128,195,0.95) 0%, rgba(37,128,195,0.4) 35%, transparent 75%)',
            'radial-gradient(circle, rgba(14,189,216,0.95) 0%, rgba(14,189,216,0.4) 35%, transparent 75%)',
            'radial-gradient(circle, rgba(46,224,201,0.95) 0%, rgba(46,224,201,0.4) 35%, transparent 75%)',
            'radial-gradient(circle, rgba(139,231,82,0.95) 0%, rgba(139,231,82,0.4) 35%, transparent 75%)',
            'radial-gradient(circle, rgba(183,243,71,0.95) 0%, rgba(183,243,71,0.4) 35%, transparent 75%)',
            'radial-gradient(circle, rgba(37,128,195,0.95) 0%, rgba(37,128,195,0.4) 35%, transparent 75%)',
          ],
          boxShadow: [
            '0 0 36px rgba(37,128,195,0.9), 0 0 72px rgba(37,128,195,0.4), 0 0 108px rgba(37,128,195,0.2)',
            '0 0 36px rgba(14,189,216,0.9), 0 0 72px rgba(14,189,216,0.4), 0 0 108px rgba(14,189,216,0.2)',
            '0 0 36px rgba(46,224,201,0.9), 0 0 72px rgba(46,224,201,0.4), 0 0 108px rgba(46,224,201,0.2)',
            '0 0 36px rgba(139,231,82,0.9), 0 0 72px rgba(139,231,82,0.4), 0 0 108px rgba(139,231,82,0.2)',
            '0 0 36px rgba(183,243,71,0.9), 0 0 72px rgba(183,243,71,0.4), 0 0 108px rgba(183,243,71,0.2)',
            '0 0 36px rgba(37,128,195,0.9), 0 0 72px rgba(37,128,195,0.4), 0 0 108px rgba(37,128,195,0.2)',
          ],
        }}
        transition={{
          rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
          background: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
          boxShadow: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Conditions row                                                     */
/* ------------------------------------------------------------------ */
function ConditionChip({ icon: Icon, label, value }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 py-2">
      <Icon className="w-4 h-4 text-foam/40" strokeWidth={1.5} />
      <p className="text-foam font-semibold text-sm">{value}</p>
      <p className="text-foam/30 text-[10px] uppercase tracking-wider">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Catch card (compact)                                              */
/* ------------------------------------------------------------------ */
function CatchCard({ c, t }) {
  const img = c.photo_urls?.[0] || null;
  const w = c.weight_kg ? `${Number(c.weight_kg).toFixed(1)} kg` : (c.length_cm ? `${c.length_cm} cm` : '—');
  return (
    <Link to="/mycatches" className="flex-shrink-0">
      <motion.div whileTap={{ scale: 0.96 }} className="relative w-24 h-32 rounded-2xl overflow-hidden">
        {img ? (
          <img src={img} alt={c.species || ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-navy-700 text-2xl">🐟</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white font-bold text-[11px] truncate">{c.species || '?'}</p>
          <p className="text-foam/50 text-[10px]">{w}</p>
        </div>
      </motion.div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Home                                                         */
/* ------------------------------------------------------------------ */
export default function Home() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me().catch(() => null),
      fetchWithCache('my_catches', () => base44.entities.Catch.list('-caught_date', 50)),
    ]).then(([u, list]) => {
      setUser(u);
      setCatches(Array.isArray(list) ? list : []);
      setLoading(false);
    });
  }, []);

  const strike = useMemo(() => getStrikeData(), []);
  const conditions = useMemo(() => getConditions(), []);
  const solunar = useMemo(() => getSolunarData(), []);
  const nearbySpots = useMemo(() => getNearbySpots(), []);
  const tips = useMemo(() => getTips(solunar, conditions), [solunar, conditions]);
  const firstName = user?.full_name?.split(' ')[0] || t('home.defaultName', { defaultValue: 'Angler' });
  const totalCatches = catches.length;
  const speciesCount = useMemo(() => new Set(catches.map(c => c.species).filter(Boolean)).size, [catches]);
  const trust = useMemo(() => aggregateTrust(catches), [catches]);
  const recentCatches = useMemo(() => catches.slice(0, 8), [catches]);
  const hotSpecies = useMemo(() => todaysHotSpecies(catches, 14), [catches]);

  const tod = getTimeOfDay(new Date().getHours());

  return (
    <PageTransition>
      <div className="px-4 pt-4 pb-4 space-y-5">

        {/* ── Welcome Header ── */}
        <WelcomeHeader user={user} />

        {/* ── Insight Bar ── */}
        {loading ? <SkeletonInsight /> : <FadeIn><InsightBar catches={catches} /></FadeIn>}

        {/* ── Strike Timer Hero ── */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: tideEase }}
        >
          <StrikeGauge
            progress={strike.progress}
            active={strike.active}
            minutes={strike.minutes}
            type={strike.type}
          />
        </motion.div>

        {/* ── Conditions row ── */}
        <motion.div
          className="liquid-glass rounded-2xl flex items-center divide-x divide-foam/5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: tideEase }}
        >
          <ConditionChip
            icon={Wind}
            label={t('home.cond_wind', { defaultValue: 'Wind' })}
            value={`${conditions.windDir} ${conditions.windSpeed}km/h`}
          />
          <ConditionChip
            icon={Waves}
            label={t('home.cond_tide', { defaultValue: 'Tide' })}
            value={`${t(`home.tide_${conditions.tidePhase}`, { defaultValue: conditions.tidePhase })} ${conditions.tideHeight}m`}
          />
          <ConditionChip
            icon={Thermometer}
            label={t('home.cond_temp', { defaultValue: 'Temp' })}
            value={`${conditions.temp}°C`}
          />
        </motion.div>

        {/* ── Stay Ready CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: tideEase }}
        >
          <Link to="/upload">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-2xl font-display font-bold text-base text-navy-900 relative overflow-hidden sheen"
              style={{
                background: 'linear-gradient(135deg, #B6F03C 0%, #2EE0C9 60%, #2DA8FF 100%)',
                boxShadow: '0 8px 28px rgba(46,224,201,0.35), 0 0 0 1px rgba(182,240,60,0.2)',
              }}
            >
              {strike.active
                ? t('home.cta_strike_now', { defaultValue: 'Strike Now — Log Catch' })
                : t('home.cta_stay_ready', { defaultValue: 'Stay Ready' })}
            </motion.button>
          </Link>
        </motion.div>

        {/* ── Quick stats ── */}
        {loading && <SkeletonStats />}
        <motion.div
          className={`grid grid-cols-3 gap-2${loading ? ' hidden' : ''}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: tideEase }}
        >
          <div className="liquid-glass-subtle rounded-2xl p-3 text-center">
            <p className="font-display font-extrabold text-xl text-foam">
              <AnimatedNumber value={totalCatches} />
            </p>
            <p className="text-foam/35 text-[10px] uppercase tracking-wider mt-0.5">
              {t('home.total_catches', { defaultValue: 'Catches' })}
            </p>
          </div>
          <div className="liquid-glass-subtle rounded-2xl p-3 text-center">
            <p className="font-display font-extrabold text-xl text-gradient-tide">
              <AnimatedNumber value={speciesCount} />
            </p>
            <p className="text-foam/35 text-[10px] uppercase tracking-wider mt-0.5">
              {t('home.stat_species', { defaultValue: 'Species' })}
            </p>
          </div>
          <div className="liquid-glass-subtle rounded-2xl p-3 text-center">
            <p className="font-display font-extrabold text-xl text-gradient-sun">
              {trust.avgScore}
            </p>
            <p className="text-foam/35 text-[10px] uppercase tracking-wider mt-0.5">
              {t('home.stat_trust', { defaultValue: 'Trust' })}
            </p>
          </div>
        </motion.div>

        {/* ── Recent catches (horizontal scroll) ── */}
        {recentCatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6, ease: tideEase }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-foam text-base">
                {t('home.recent_catches', { defaultValue: 'Recent Catches' })}
              </h2>
              <Link to="/mycatches" className="text-tide-400 text-xs flex items-center gap-0.5">
                {t('common.all', { defaultValue: 'All' })} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
              {recentCatches.map((c, i) => (
                <motion.div
                  key={c.id || `${c.species}-${i}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + i * 0.05, ease: tideEase }}
                >
                  <CatchCard c={c} t={t} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Hot species ── */}
        {hotSpecies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7, ease: tideEase }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-sun-400" />
              <h2 className="font-display font-bold text-foam text-base">
                {t('home.hot_species', { defaultValue: 'Hot Species' })}
              </h2>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {hotSpecies.slice(0, 5).map((s, i) => (
                <motion.div
                  key={s.species}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 + i * 0.06, ease: tideEase }}
                  className="flex-shrink-0 liquid-glass-subtle rounded-xl px-3 py-2 flex items-center gap-2"
                >
                  <span className="text-base">{i === 0 ? '🔥' : '🐟'}</span>
                  <div>
                    <p className={`font-display font-bold text-xs ${i === 0 ? 'text-gradient-sun' : 'text-foam'}`}>
                      {s.species}
                    </p>
                    <p className="text-foam/30 text-[10px]">
                      {t('home.hot_n', { n: s.count, count: s.count, defaultValue: `${s.count}×` })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Action tiles ── */}
        <motion.div
          className="grid grid-cols-2 gap-2.5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8, ease: tideEase }}
        >
          {[
            { path: '/map',         icon: Target,   label: t('home.tile_spots', { defaultValue: 'Spots' }),       sub: t('home.tile_spots_sub', { defaultValue: 'Find fishing spots' }) },
            { path: '/dashboard',   icon: Sparkles,  label: t('home.tile_stats', { defaultValue: 'Stats' }),        sub: t('home.tile_stats_sub', { defaultValue: 'Your analytics' }) },
            { path: '/fishencyclopedia', icon: Fish,  label: t('home.tile_wiki', { defaultValue: 'Fish Wiki' }),    sub: t('home.tile_wiki_sub', { defaultValue: 'Species guide' }) },
            { path: '/tournaments', icon: Trophy,    label: t('home.tile_tournaments', { defaultValue: 'Events' }), sub: t('home.tile_tournaments_sub', { defaultValue: 'Compete & win' }) },
          ].map((tile, i) => {
            const Icon = tile.icon;
            return (
              <Link key={tile.path} to={tile.path}>
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  className="liquid-glass-subtle rounded-2xl p-3.5 h-[76px] flex flex-col justify-between"
                >
                  <Icon className="w-5 h-5 text-tide-400" strokeWidth={1.8} />
                  <div>
                    <p className="font-display font-bold text-foam text-sm leading-tight">{tile.label}</p>
                    <p className="text-foam/30 text-[10px]">{tile.sub}</p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>

        {/* ── Bite Probability + Solunar Panel ── */}
        <motion.div
          className="liquid-glass rounded-2xl p-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9, ease: tideEase }}
        >
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Target className="w-4 h-4 text-sun-400" />
            </motion.div>
            <h2 className="font-display font-bold text-foam text-base">
              {t('home.bite_forecast', { defaultValue: 'Bite Forecast' })}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <BiteGauge probability={solunar.biteProbability} />

            <div className="flex-1 space-y-2.5">
              {/* Moon */}
              <div className="flex items-center gap-3">
                <MoonVisual phase={solunar.moonPhase} illumination={solunar.moonIllum} />
                <div>
                  <p className="text-foam font-semibold text-sm">
                    {t(`home.moon_${solunar.moonPhase}`, { defaultValue: solunar.moonPhase.replace('_', ' ') })}
                  </p>
                  <p className="text-foam/35 text-[10px]">{solunar.moonIllum}% {t('home.illuminated', { defaultValue: 'illuminated' })}</p>
                </div>
              </div>

              {/* Pressure */}
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-foam/40" />
                <p className="text-foam/70 text-xs">
                  {solunar.pressure} hPa
                  <motion.span
                    className="ml-1 text-[10px]"
                    style={{ color: solunar.pressureTrend === 'falling' ? '#2EE0C9' : '#6B8AA8' }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {solunar.pressureTrend === 'falling' ? '↓' : '↑'} {t(`home.pressure_${solunar.pressureTrend}`, { defaultValue: solunar.pressureTrend })}
                  </motion.span>
                </p>
              </div>

              {/* Water temp */}
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-tide-400" />
                <p className="text-foam/70 text-xs">
                  {t('home.water_temp', { defaultValue: 'Water' })} {solunar.waterTemp}°C
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Sun Times Bar ── */}
        <motion.div
          className="liquid-glass-subtle rounded-2xl p-3 flex items-center justify-around"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0, ease: tideEase }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ y: [-1, 1, -1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sunrise className="w-4 h-4 text-amber-400" />
            </motion.div>
            <div>
              <p className="text-foam/35 text-[9px] uppercase tracking-wider">{t('home.sunrise', { defaultValue: 'Sunrise' })}</p>
              <p className="text-foam font-semibold text-sm">{solunar.sunrise}</p>
            </div>
          </div>

          <div className="w-px h-8 bg-foam/8" />

          <div className="flex items-center gap-2">
            <motion.div
              animate={{ y: [1, -1, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            >
              <Sunset className="w-4 h-4 text-orange-400" />
            </motion.div>
            <div>
              <p className="text-foam/35 text-[9px] uppercase tracking-wider">{t('home.sunset', { defaultValue: 'Sunset' })}</p>
              <p className="text-foam font-semibold text-sm">{solunar.sunset}</p>
            </div>
          </div>

          <div className="w-px h-8 bg-foam/8" />

          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Clock className="w-4 h-4 text-foam/40" />
            </motion.div>
            <div>
              <p className="text-foam/35 text-[9px] uppercase tracking-wider">{t('home.golden_hour', { defaultValue: 'Golden Hour' })}</p>
              <p className="text-gradient-sun font-semibold text-sm">
                {(() => {
                  const h = new Date().getHours();
                  return (h >= 5 && h <= 8) || (h >= 17 && h <= 20) ? t('home.now_active', { defaultValue: 'Active!' }) : t('home.next_evening', { defaultValue: '17:00' });
                })()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Smart Tips ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1, ease: tideEase }}
        >
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Eye className="w-4 h-4 text-tide-400" />
            </motion.div>
            <h2 className="font-display font-bold text-foam text-base">
              {t('home.smart_tips', { defaultValue: 'Smart Tips' })}
            </h2>
          </div>

          <div className="space-y-2">
            {tips.map((tip, i) => {
              const TipIcon = tip.icon;
              return (
                <motion.div
                  key={tip.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1.2 + i * 0.1, ease: tideEase }}
                  className="liquid-glass-subtle rounded-xl px-3.5 py-2.5 flex items-center gap-3"
                >
                  <motion.div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${tip.color}15` }}
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                  >
                    <TipIcon className="w-4 h-4" style={{ color: tip.color }} />
                  </motion.div>
                  <p className="text-foam/70 text-xs leading-relaxed">
                    {t(`home.${tip.text}`, { defaultValue: {
                      tip_high_bite: 'Bite probability is high right now — great time to hit the water!',
                      tip_pressure_drop: 'Barometric pressure is dropping — fish tend to feed more actively.',
                      tip_moon_peak: 'New/full moon phase — peak solunar activity for predatory fish.',
                      tip_windy: 'Moderate wind stirs the water — try casting near windblown banks.',
                      tip_cold_water: 'Water is cool — slow your retrieve, fish deeper.',
                      tip_default: 'Check conditions and pick your best window to fish today.',
                    }[tip.text] || 'Check conditions and plan your session.' })}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Nearby Spots ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3, ease: tideEase }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  color: ['#2DA8FF', '#2EE0C9', '#B6F03C', '#2DA8FF'],
                }}
                transition={{ rotate: { duration: 12, repeat: Infinity, ease: 'linear' }, color: { duration: 6, repeat: Infinity } }}
              >
                <Compass className="w-4 h-4" />
              </motion.div>
              <h2 className="font-display font-bold text-foam text-base">
                {t('home.nearby_spots', { defaultValue: 'Nearby Spots' })}
              </h2>
            </div>
            <Link to="/map" className="text-tide-400 text-xs flex items-center gap-0.5">
              {t('home.view_map', { defaultValue: 'Map' })} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
            {nearbySpots.map((spot, i) => (
              <SpotCard key={spot.name} spot={spot} index={i} t={t} />
            ))}
          </div>
        </motion.div>

        {/* ── Weekly Forecast Mini ── */}
        <motion.div
          className="liquid-glass rounded-2xl p-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4, ease: tideEase }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-foam/40" />
            <h2 className="font-display font-bold text-foam text-base">
              {t('home.week_forecast', { defaultValue: '7-Day Bite Forecast' })}
            </h2>
          </div>

          <div className="flex items-end justify-between gap-1.5">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const score = Math.round(40 + Math.sin((new Date().getDay() + i) * 1.2) * 35 + Math.random() * 10);
              const clamped = Math.max(20, Math.min(95, score));
              const barColor = clamped >= 70 ? '#B6F03C' : clamped >= 50 ? '#2EE0C9' : '#2DA8FF';
              const isToday = i === 0;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                  <motion.p
                    className="text-[10px] font-bold"
                    style={{ color: barColor }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 + i * 0.05 }}
                  >
                    {clamped}
                  </motion.p>
                  <div className="w-full rounded-full overflow-hidden relative" style={{ height: 56, background: 'rgba(232,240,245,0.04)' }}>
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 rounded-full"
                      style={{
                        background: `linear-gradient(180deg, ${barColor} 0%, ${barColor}40 100%)`,
                        boxShadow: `0 0 8px ${barColor}40`,
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${clamped}%` }}
                      transition={{ duration: 0.8, delay: 1.5 + i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
                    />
                  </div>
                  <p className={`text-[10px] ${isToday ? 'text-foam font-bold' : 'text-foam/35'}`}>
                    {isToday ? t('home.today', { defaultValue: 'Today' }) : t(`home.day_${day.toLowerCase()}`, { defaultValue: day })}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Empty state for new users ── */}
        {!loading && totalCatches === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: tideEase }}
          >
            <Link to="/upload">
              <div className="liquid-glass rounded-2xl p-6 text-center">
                <div className="w-14 h-14 rounded-2xl gradient-tide mx-auto mb-3 flex items-center justify-center">
                  <Fish className="w-7 h-7 text-white" />
                </div>
                <p className="font-display font-bold text-foam mb-1">
                  {t('home.empty_catches_title', { defaultValue: 'Log your first catch' })}
                </p>
                <p className="text-foam/40 text-sm">
                  {t('home.empty_catches_sub', { defaultValue: 'Start building your fishing journal' })}
                </p>
              </div>
            </Link>
          </motion.div>
        )}

        <div className="h-4" />
      </div>
    </PageTransition>
  );
}