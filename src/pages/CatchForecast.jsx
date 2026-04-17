import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Wind, Thermometer, Moon, Anchor, Clock, Zap } from 'lucide-react';
import { LineChart, Line } from 'recharts';
import PageTransition from '../components/ui/PageTransition';
import PaywallModal from '../components/shared/PaywallModal';
import { useEntitlement } from '@/hooks/useEntitlement';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';

const tideEase = [0.2, 0.8, 0.2, 1];

const PERIODS = ['today', 'tomorrow', '3_days', '7_days'];

const CONFIDENCE_CFG = {
  low:    { color: '#4DC3D1', bg: 'rgba(77,195,209,0.12)' },
  medium: { color: '#F5C34B', bg: 'rgba(245,195,75,0.12)' },
  high:   { color: '#FF6B5B', bg: 'rgba(255,107,91,0.15)' },
};

function ScoreRing({ score }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 70 ? '#F5C34B' : score >= 40 ? '#1FA7B8' : '#7FDCE5';

  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(127,220,229,0.12)" strokeWidth="8" />
        <motion.circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
          transform="rotate(-90 56 56)" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-extrabold text-3xl" style={{ color }}>{score}</span>
        <span className="text-foam/40 text-xs">/ 100</span>
      </div>
    </div>
  );
}

export default function CatchForecast() {
  const { t } = useTranslation();
  const { canAccess, requiredTier } = useEntitlement();
  const hasAccess = canAccess('catch_forecast');
  const [forecasts, setForecasts] = useState([]);
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedWater, setSelectedWater] = useState('');
  const [period, setPeriod] = useState('today');
  const [result, setResult] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.ForecastModel.list('-forecast_date', 100),
      base44.entities.Species.list('name', 200),
    ]).then(([fc, sp]) => {
      setForecasts(fc || []);
      setSpecies((sp || []).map(s => s.name).filter(Boolean).sort());
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadForecast = async () => {
    if (!selectedSpecies) return;
    setGenerating(true);
    setResult(null);
    // Try to find existing
    const existing = forecasts.find(f => f.target_species === selectedSpecies && f.forecast_period === period);
    if (existing) {
      setResult(existing);
      setGenerating(false);
      return;
    }
    // Generate via AI
    const today = new Date().toISOString().split('T')[0];
    const ai = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a fishing forecast for species "${selectedSpecies}" at "${selectedWater || 'German freshwater'}" for period "${period}" on date ${today}. Return a detailed JSON forecast. Use realistic data.`,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_score: { type: 'number' },
          confidence_level: { type: 'string' },
          best_time_slots: { type: 'array', items: { type: 'object', properties: { start: { type: 'string' }, end: { type: 'string' }, score: { type: 'number' } } } },
          recommended_techniques: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, score: { type: 'number' } } } },
          recommended_baits: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, score: { type: 'number' } } } },
          weather_factors: { type: 'object', properties: { pressure: { type: 'string' }, wind: { type: 'string' }, temp: { type: 'string' }, summary: { type: 'string' } } },
          moon_factors: { type: 'object', properties: { phase: { type: 'string' }, influence: { type: 'string' } } },
          tide_factors: { type: 'object', properties: { summary: { type: 'string' } } },
        }
      }
    });
    setResult({ ...ai, target_species: selectedSpecies, target_waterbody: selectedWater, forecast_period: period, forecast_date: today });
    setGenerating(false);
  };

  if (loading) return <PageTransition><div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" /></div></PageTransition>;

  return (
    <PageTransition>
      {!hasAccess && (
        <PaywallModal open={true} onClose={() => window.history.back()} featureKey="catch_forecast" requiredTier={requiredTier('catch_forecast')} />
      )}
      {hasAccess && (
      <div className="px-4 pt-6 pb-4 space-y-5">
        <div>
          <p className="text-foam/50 text-sm">{t('catch_forecast.subtitle')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('catch_forecast.title')}</h1>
        </div>

        {/* Selectors */}
        <div className="space-y-2">
          <select value={selectedSpecies} onChange={e => setSelectedSpecies(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl glass-card text-foam text-sm outline-none border-none">
            <option value="">🐟 {t('catch_forecast.pick_species')}</option>
            {species.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input value={selectedWater} onChange={e => setSelectedWater(e.target.value)}
            placeholder={`🌊 ${t('catch_forecast.waterbody_placeholder')}`}
            className="w-full px-4 py-3 rounded-2xl glass-card text-foam placeholder-foam/30 text-sm outline-none" />
          <div className="flex gap-2">
            {PERIODS.map((k) => (
              <button key={k} onClick={() => setPeriod(k)}
                className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all ${period === k ? 'gradient-tide text-white' : 'glass-card text-foam/60'}`}>
                {t(`catch_forecast.period_${k}`)}
              </button>
            ))}
          </div>
          <button onClick={loadForecast} disabled={!selectedSpecies || generating}
            className={`w-full py-4 rounded-2xl font-display font-bold text-white transition-all ${selectedSpecies && !generating ? 'gradient-tide glow-tide' : 'bg-abyss-700 text-foam/30'}`}>
            {generating ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> {t('catch_forecast.calculating')}</span> : `⚡ ${t('catch_forecast.start')}`}
          </button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Score Ring */}
            <div className="glass-card rounded-3xl p-6 text-center"
              style={{ border: '1px solid rgba(245,195,75,0.2)' }}>
              <p className="text-foam/50 text-xs uppercase tracking-widest mb-4">{t('catch_forecast.score_label')}</p>
              <ScoreRing score={result.overall_score || 0} />
              {result.confidence_level && (
                <div className="mt-4 inline-block px-3 py-1.5 rounded-xl text-xs font-bold"
                  style={{ background: CONFIDENCE_CFG[result.confidence_level]?.bg, color: CONFIDENCE_CFG[result.confidence_level]?.color }}>
                  {t('catch_forecast.confidence')}: {t(`catch_forecast.confidence_${result.confidence_level}`)}
                </div>
              )}
            </div>

            {/* Best time slots */}
            {result.best_time_slots?.length > 0 && (
              <div className="glass-card rounded-2xl p-4">
                <p className="font-display font-bold text-foam text-sm mb-3">{t('catch_forecast.best_windows')}</p>
                <div className="space-y-2">
                  {result.best_time_slots.map((slot, i) => (
                    <div key={slot.label || slot.time || i} className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-tide-400 flex-shrink-0" />
                      <span className="text-foam text-sm font-semibold">{slot.start} – {slot.end}</span>
                      {slot.score && (
                        <div className="ml-auto flex items-center gap-1.5">
                          <div className="h-1.5 w-16 bg-abyss-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full gradient-tide" style={{ width: `${slot.score}%` }} />
                          </div>
                          <span className="text-tide-400 text-xs">{slot.score}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Techniques + Baits */}
            <div className="grid grid-cols-2 gap-3">
              {result.recommended_techniques?.length > 0 && (
                <div className="glass-card rounded-2xl p-3">
                  <p className="text-foam/40 text-xs mb-2">{t('catch_forecast.techniques')}</p>
                  {result.recommended_techniques.slice(0, 3).map((tech, i) => (
                    <p key={tech.name || tech} className="text-foam text-xs font-semibold mb-1 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-tide-400" /> {tech.name || tech}
                    </p>
                  ))}
                </div>
              )}
              {result.recommended_baits?.length > 0 && (
                <div className="glass-card rounded-2xl p-3">
                  <p className="text-foam/40 text-xs mb-2">{t('catch_forecast.baits')}</p>
                  {result.recommended_baits.slice(0, 3).map((b, i) => (
                    <p key={b.name || b} className="text-foam text-xs font-semibold mb-1 flex items-center gap-1">
                      <Anchor className="w-3 h-3 text-sun-400" /> {b.name || b}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Factors */}
            <div className="glass-card rounded-2xl p-4">
              <p className="font-display font-bold text-foam text-sm mb-3">{t('catch_forecast.factors')}</p>
              <div className="space-y-2">
                {result.weather_factors?.summary && (
                  <div className="flex items-start gap-2"><Thermometer className="w-4 h-4 text-tide-400 mt-0.5 flex-shrink-0" /><p className="text-foam/60 text-xs">{result.weather_factors.summary}</p></div>
                )}
                {result.moon_factors && (
                  <div className="flex items-start gap-2"><Moon className="w-4 h-4 text-sun-400/70 mt-0.5 flex-shrink-0" /><p className="text-foam/60 text-xs">{result.moon_factors.phase} · {result.moon_factors.influence}</p></div>
                )}
                {result.tide_factors?.summary && (
                  <div className="flex items-start gap-2"><Anchor className="w-4 h-4 text-foam/40 mt-0.5 flex-shrink-0" /><p className="text-foam/60 text-xs">{result.tide_factors.summary}</p></div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {!result && !generating && (
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="text-5xl mb-3">⚡</div>
            <p className="font-display font-bold text-foam">{t('catch_forecast.start')}</p>
            <p className="text-foam/40 text-sm mt-1">{t('catch_forecast.empty_hint')}</p>
          </div>
        )}

        <div className="h-4" />
      </div>
      )}
    </PageTransition>
  );
}