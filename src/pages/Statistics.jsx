import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend,
} from 'recharts';
import { Trophy, Fish, Thermometer, Wind, Gauge, Droplets } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const COLORS = ['#4DC3D1', '#2EE0C9', '#B6F03C', '#F5C34B', '#FF6B5B', '#FFD872', '#2DA8FF', '#A78BFA'];
const MOON_COLORS = { 'Neumond': '#1F2937', 'Zunehmend': '#6366F1', 'Halbmond': '#F59E0B', 'Vollmond': '#FDE68A', 'Abnehmend': '#64748B' };

const tideEase = [0.2, 0.8, 0.2, 1];

export default function Statistics() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('12');

  useEffect(() => {
    base44.entities.Catch.list('-caught_date', 500)
      .then((data) => {
        setCatches(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ---- Filtering ----
  const filteredCatches = useMemo(() => {
    const now = new Date();
    const months = parseInt(timeRange, 10);
    const since = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    return catches.filter((c) => {
      const d = c.caught_date ? new Date(c.caught_date) : c.created_date ? new Date(c.created_date) : null;
      return d && d >= since;
    });
  }, [catches, timeRange]);

  // ---- KPIs ----
  const totalCatches = filteredCatches.length;
  const topSpecies = useMemo(() => {
    if (!filteredCatches.length) return '—';
    const counts = filteredCatches.reduce((acc, c) => {
      const s = c.species || '—';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  }, [filteredCatches]);
  const avgSize = useMemo(() => {
    if (!filteredCatches.length) return 0;
    const lengths = filteredCatches.map((c) => c.length_cm || 0).filter((v) => v > 0);
    if (!lengths.length) return 0;
    return (lengths.reduce((a, b) => a + b, 0) / lengths.length).toFixed(1);
  }, [filteredCatches]);
  const hookPoints = user?.hook_points || 0;

  // ---- Monthly ----
  const monthlyData = useMemo(() => {
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => ({
      name: t(`months_short.${m}`),
      count: 0,
    }));
    filteredCatches.forEach((c) => {
      const d = c.caught_date ? new Date(c.caught_date) : null;
      if (d && !isNaN(d)) months[d.getMonth()].count += 1;
    });
    return months;
  }, [filteredCatches, t]);

  // ---- Top species ----
  const topSpeciesData = useMemo(() => {
    const counts = {};
    filteredCatches.forEach((c) => {
      const s = c.species || '—';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredCatches]);

  // ---- Moon phases (Radar) ----
  const moonPhaseData = useMemo(() => {
    const phases = { Neumond: 0, Zunehmend: 0, Halbmond: 0, Vollmond: 0, Abnehmend: 0 };
    filteredCatches.forEach((c) => {
      if (c.moon_phase && phases[c.moon_phase] !== undefined) {
        phases[c.moon_phase] += 1;
      }
    });
    return Object.entries(phases).map(([name, value]) => ({
      name: t(`statistics.moon.${name.toLowerCase()}`, { defaultValue: name }),
      value,
    }));
  }, [filteredCatches, t]);

  // ---- Time of day (Pie) ----
  const timeOfDayData = useMemo(() => {
    const buckets = {
      morning: { name: t('statistics.tod.morning'), value: 0 },
      midday: { name: t('statistics.tod.midday'), value: 0 },
      afternoon: { name: t('statistics.tod.afternoon'), value: 0 },
      evening: { name: t('statistics.tod.evening'), value: 0 },
      night: { name: t('statistics.tod.night'), value: 0 },
    };
    filteredCatches.forEach((c) => {
      const h = parseInt((c.caught_time || '').split(':')[0], 10);
      if (!Number.isFinite(h)) return;
      if (h >= 6 && h < 12) buckets.morning.value += 1;
      else if (h >= 12 && h < 14) buckets.midday.value += 1;
      else if (h >= 14 && h < 18) buckets.afternoon.value += 1;
      else if (h >= 18 && h < 22) buckets.evening.value += 1;
      else buckets.night.value += 1;
    });
    return Object.values(buckets).filter((b) => b.value > 0);
  }, [filteredCatches, t]);

  // ---- Size distribution (Bar) ----
  const sizeDistribution = useMemo(() => {
    const bins = [
      { range: '0-10', count: 0 }, { range: '10-20', count: 0 },
      { range: '20-30', count: 0 }, { range: '30-40', count: 0 },
      { range: '40-50', count: 0 }, { range: '50-70', count: 0 },
      { range: '70-100', count: 0 }, { range: '100+', count: 0 },
    ];
    filteredCatches.forEach((c) => {
      const l = c.length_cm || 0;
      if (l < 10) bins[0].count += 1;
      else if (l < 20) bins[1].count += 1;
      else if (l < 30) bins[2].count += 1;
      else if (l < 40) bins[3].count += 1;
      else if (l < 50) bins[4].count += 1;
      else if (l < 70) bins[5].count += 1;
      else if (l < 100) bins[6].count += 1;
      else bins[7].count += 1;
    });
    return bins;
  }, [filteredCatches]);

  // ---- Weather correlation (temp vs. catch count) ----
  const weatherCorrelation = useMemo(() => {
    const buckets = {};
    filteredCatches.forEach((c) => {
      const t_c = c.air_temp_c;
      if (t_c == null || !Number.isFinite(t_c)) return;
      const b = Math.floor(t_c / 5) * 5; // 5°C bins
      const key = `${b}–${b + 5}`;
      buckets[key] = (buckets[key] || 0) + 1;
    });
    return Object.entries(buckets)
      .map(([range, count]) => ({ range, count, sort: parseInt(range, 10) }))
      .sort((a, b) => a.sort - b.sort);
  }, [filteredCatches]);

  // ---- Pressure correlation ----
  const pressureCorrelation = useMemo(() => {
    const rising = filteredCatches.filter((c) => c.pressure_trend === 'rising').length;
    const stable = filteredCatches.filter((c) => c.pressure_trend === 'stable').length;
    const falling = filteredCatches.filter((c) => c.pressure_trend === 'falling').length;
    return [
      { name: t('statistics.pressure.rising'), value: rising },
      { name: t('statistics.pressure.stable'), value: stable },
      { name: t('statistics.pressure.falling'), value: falling },
    ].filter((d) => d.value > 0);
  }, [filteredCatches, t]);

  // ---- Species records ----
  const speciesRecords = useMemo(() => {
    const map = {};
    catches.forEach((c) => {
      const s = c.species || '—';
      if (!map[s]) map[s] = { species: s, maxLength: 0, maxWeight: 0, total: 0, released: 0 };
      map[s].total += 1;
      if (c.released) map[s].released += 1;
      if ((c.length_cm || 0) > map[s].maxLength) map[s].maxLength = c.length_cm || 0;
      if ((c.weight_kg || 0) > map[s].maxWeight) map[s].maxWeight = c.weight_kg || 0;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [catches]);

  // ---- Best catch hero ----
  const bestCatch = useMemo(() => {
    const byWeight = [...catches].filter((c) => c.weight_kg).sort((a, b) => b.weight_kg - a.weight_kg);
    return byWeight[0] || catches[0];
  }, [catches]);

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </PageTransition>
    );
  }

  const tooltipStyle = {
    background: 'rgba(2,21,33,0.95)',
    border: '1px solid rgba(77,195,209,0.25)',
    borderRadius: '12px',
    color: '#E8F0F5',
    fontSize: '12px',
  };

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-24 space-y-6">
        {/* Header */}
        <div>
          <p className="text-foam/50 text-sm">{t('statistics.subtitle')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('statistics.title')}</h1>
        </div>

        {/* Time range filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {[
            { v: '1', key: 'statistics.range.30d' },
            { v: '3', key: 'statistics.range.3m' },
            { v: '6', key: 'statistics.range.6m' },
            { v: '12', key: 'statistics.range.12m' },
          ].map((r) => (
            <button
              key={r.v}
              onClick={() => setTimeRange(r.v)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                timeRange === r.v ? 'gradient-tide text-white' : 'glass-card text-foam/60'
              }`}
            >
              {t(r.key)}
            </button>
          ))}
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-3">
          <KPI icon="🎣" label={t('statistics.kpi.catches')} value={totalCatches} />
          <KPI icon="🐟" label={t('statistics.kpi.top_species')} value={topSpecies} />
          <KPI icon="📏" label={t('statistics.kpi.avg_size')} value={`${avgSize} cm`} />
          <KPI icon="⚡" label={t('statistics.kpi.hook_points')} value={hookPoints} />
        </div>

        {/* Best catch hero */}
        {bestCatch && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: tideEase }}
            className="glass-card rounded-3xl overflow-hidden"
            style={{ border: '1px solid rgba(245,195,75,0.25)', boxShadow: '0 0 30px rgba(245,195,75,0.1)' }}
          >
            {bestCatch.photo_urls?.[0] && (
              <div className="h-44 relative">
                <img src={bestCatch.photo_urls[0]} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-abyss-950 via-transparent to-transparent" />
                <div
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(245,195,75,0.9)', color: '#021521' }}
                >
                  <Trophy className="w-3 h-3 inline mr-1" />
                  {t('statistics.badge_best')}
                </div>
              </div>
            )}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-display font-bold text-foam text-lg">{bestCatch.species || '—'}</p>
                <p className="text-foam/50 text-sm">{bestCatch.caught_date || bestCatch.created_date?.split('T')[0]}</p>
              </div>
              <div className="text-right">
                {bestCatch.weight_kg && <p className="font-display font-extrabold text-sun-400 text-2xl">{bestCatch.weight_kg} kg</p>}
                {bestCatch.length_cm && <p className="text-foam/50 text-sm">{bestCatch.length_cm} cm</p>}
              </div>
            </div>
          </motion.div>
        )}

        {filteredCatches.length === 0 ? (
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="text-4xl mb-3">🎣</div>
            <p className="text-foam font-bold">{t('statistics.empty_title')}</p>
            <p className="text-foam/40 text-sm mt-1">{t('statistics.empty_sub')}</p>
          </div>
        ) : (
          <>
            {/* Monthly chart */}
            <ChartCard title={`📈 ${t('statistics.chart.monthly')}`}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,240,245,0.06)" />
                  <XAxis dataKey="name" stroke="rgba(232,240,245,0.5)" fontSize={11} />
                  <YAxis stroke="rgba(232,240,245,0.5)" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(77,195,209,0.08)' }} />
                  <Bar dataKey="count" fill="#4DC3D1" radius={[6, 6, 0, 0]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Top species + Time of day */}
            <div className="grid grid-cols-1 gap-4">
              <ChartCard title={`🐟 ${t('statistics.chart.top_species')}`}>
                <ResponsiveContainer width="100%" height={Math.max(200, topSpeciesData.length * 30)}>
                  <BarChart data={topSpeciesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,240,245,0.06)" />
                    <XAxis type="number" stroke="rgba(232,240,245,0.5)" fontSize={11} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="rgba(232,240,245,0.5)" fontSize={11} width={80} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(46,224,201,0.08)' }} />
                    <Bar dataKey="count" fill="#2EE0C9" radius={[0, 6, 6, 0]} animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {timeOfDayData.length > 0 && (
                <ChartCard title={`🕐 ${t('statistics.chart.time_of_day')}`}>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={timeOfDayData}
                        cx="50%" cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={90}
                        innerRadius={45}
                        dataKey="value"
                        animationDuration={800}
                      >
                        {timeOfDayData.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}

              {moonPhaseData.some((d) => d.value > 0) && (
                <ChartCard title={`🌙 ${t('statistics.chart.moon_phase')}`}>
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={moonPhaseData}>
                      <PolarGrid stroke="rgba(232,240,245,0.1)" />
                      <PolarAngleAxis dataKey="name" stroke="rgba(232,240,245,0.6)" fontSize={10} />
                      <PolarRadiusAxis stroke="rgba(232,240,245,0.3)" fontSize={9} />
                      <Radar
                        name={t('statistics.chart.moon_phase')}
                        dataKey="value"
                        stroke="#F5C34B"
                        fill="#F5C34B"
                        fillOpacity={0.45}
                        animationDuration={800}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}

              <ChartCard title={`📏 ${t('statistics.chart.size_distribution')}`}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={sizeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,240,245,0.06)" />
                    <XAxis dataKey="range" stroke="rgba(232,240,245,0.5)" fontSize={10} />
                    <YAxis stroke="rgba(232,240,245,0.5)" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(182,240,60,0.08)' }} />
                    <Bar dataKey="count" fill="#B6F03C" radius={[6, 6, 0, 0]} animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {weatherCorrelation.length > 0 && (
                <ChartCard title={`🌡️ ${t('statistics.chart.temp_correlation')}`}>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={weatherCorrelation}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,240,245,0.06)" />
                      <XAxis dataKey="range" stroke="rgba(232,240,245,0.5)" fontSize={10} unit="°C" />
                      <YAxis stroke="rgba(232,240,245,0.5)" fontSize={11} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(77,195,209,0.3)' }} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#FF6B5B"
                        strokeWidth={2.5}
                        dot={{ fill: '#FF6B5B', r: 4 }}
                        activeDot={{ r: 6 }}
                        animationDuration={800}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}

              {pressureCorrelation.length > 0 && (
                <ChartCard title={`🌫️ ${t('statistics.chart.pressure')}`}>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pressureCorrelation}
                        cx="50%" cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        dataKey="value"
                        animationDuration={800}
                      >
                        {pressureCorrelation.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}
            </div>
          </>
        )}

        {/* Species records */}
        {speciesRecords.length > 0 && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-tide-300/10">
              <p className="font-display font-bold text-foam text-sm">
                {t('statistics.species_records')}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-tide-300/10">
                    {[
                      t('statistics.table_header_species'),
                      t('statistics.table_header_length'),
                      t('statistics.table_header_weight'),
                      t('statistics.table_header_total'),
                      t('statistics.table_header_cr'),
                    ].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-foam/40 font-semibold whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {speciesRecords.map((r, i) => (
                    <motion.tr
                      key={r.species}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-tide-300/5 last:border-0"
                    >
                      <td className="px-3 py-3 text-foam font-semibold whitespace-nowrap">{r.species}</td>
                      <td className="px-3 py-3 text-tide-400 font-bold">{r.maxLength ? `${r.maxLength} cm` : '—'}</td>
                      <td className="px-3 py-3 text-sun-400 font-bold">{r.maxWeight ? `${r.maxWeight} kg` : '—'}</td>
                      <td className="px-3 py-3 text-foam/70">{r.total}</td>
                      <td className="px-3 py-3 text-foam/50">
                        {r.total ? `${Math.round((r.released / r.total) * 100)}%` : '—'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </PageTransition>
  );
}

// ---------------- Sub-components ----------------

function KPI({ icon, label, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-card rounded-2xl p-4"
    >
      <p className="text-foam/50 text-xs mb-1.5">
        <span className="mr-1">{icon}</span>
        {label}
      </p>
      <p className="text-foam text-xl font-black font-display truncate">{value}</p>
    </motion.div>
  );
}

function ChartCard({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-2xl p-4"
    >
      <h3 className="text-foam font-bold text-sm mb-3">{title}</h3>
      {children}
    </motion.div>
  );
}
