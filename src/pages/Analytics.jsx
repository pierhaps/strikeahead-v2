import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Fish, Anchor, Trophy, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';

const tideEase = [0.2, 0.8, 0.2, 1];
const COLORS = ['#1FA7B8', '#F5C34B', '#4DC3D1', '#FF6B5B', '#7FDCE5', '#FFD872'];

function KPICard({ icon: KpiIcon, label, value, sub, sun }) {
  const Icon = KpiIcon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4 flex flex-col gap-2"
      style={sun ? { border: '1px solid rgba(245,195,75,0.2)' } : {}}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${sun ? 'bg-sun-400/15' : 'bg-tide-500/15'}`}>
        <Icon className={`w-4 h-4 ${sun ? 'text-sun-400' : 'text-tide-400'}`} />
      </div>
      <p className={`font-display font-extrabold text-2xl ${sun ? 'text-sun-400' : 'text-foam'}`}>{value}</p>
      <div>
        <p className="text-foam font-semibold text-xs">{label}</p>
        {sub && <p className="text-foam/40 text-[10px]">{sub}</p>}
      </div>
    </motion.div>
  );
}

const HOURS = ['00-06','06-09','09-12','12-15','15-18','18-21','21-24'];

export default function Analytics() {
  const { t } = useTranslation();
  const ta = (k, opts) => t(`analytics.${k}`, opts);
  const MONTH_LABELS = [
    t('common.month_jan'), t('common.month_feb'), t('common.month_mar'),
    t('common.month_apr'), t('common.month_may'), t('common.month_jun'),
    t('common.month_jul'), t('common.month_aug'), t('common.month_sep'),
    t('common.month_oct'), t('common.month_nov'), t('common.month_dec'),
  ];
  const catchesName = t('analytics.catches_label', { defaultValue: 'Fänge' });

  const [catches, setCatches] = useState([]);
  const [range, setRange] = useState('30d');
  const [filterSpecies, setFilterSpecies] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Catch.list('-caught_date', 500).then(data => {
      setCatches(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const now = new Date();
  const rangeMs = { '7d': 7, '30d': 30, '90d': 90, 'year': 365, 'all': 99999 };
  const cutoff = new Date(now - rangeMs[range] * 86400000);

  const filtered = catches.filter(c => {
    const d = c.caught_date ? new Date(c.caught_date) : new Date(c.created_date);
    if (d < cutoff) return false;
    if (filterSpecies !== 'all' && c.species !== filterSpecies) return false;
    return true;
  });

  const totalCatches = filtered.length;
  const avgWeight = filtered.filter(c => c.weight_kg).length
    ? (filtered.reduce((s, c) => s + (c.weight_kg || 0), 0) / filtered.filter(c => c.weight_kg).length).toFixed(1)
    : '—';

  const speciesCounts = filtered.reduce((acc, c) => {
    acc[c.species || t('common.unknown', { defaultValue: 'Unbekannt' })] = (acc[c.species || t('common.unknown', { defaultValue: 'Unbekannt' })] || 0) + 1;
    return acc;
  }, {});
  const topSpecies = Object.entries(speciesCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  const totalHP = filtered.reduce((s, c) => s + (c.hook_points_earned || 0), 0);

  // Monthly bar data
  const monthData = Array.from({ length: 6 }, (_, i) => {
    const m = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const count = filtered.filter(c => {
      const d = c.caught_date ? new Date(c.caught_date) : new Date(c.created_date);
      return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
    }).length;
    return { name: MONTH_LABELS[m.getMonth()], count };
  });

  // Donut species
  const donutData = Object.entries(speciesCounts).slice(0, 6).map(([name, value]) => ({ name, value }));

  // Hourly success
  const hourData = HOURS.map((label, i) => {
    const count = filtered.filter(c => {
      const h = c.caught_time ? parseInt(c.caught_time.split(':')[0]) : 12;
      return h >= i * 3 && h < (i + 1) * 3;
    }).length;
    return { name: label, count };
  });

  const allSpecies = [...new Set(catches.map(c => c.species).filter(Boolean))];

  if (loading) return (
    <PageTransition><div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" />
    </div></PageTransition>
  );

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-6">
        <div>
          <p className="text-foam/50 text-sm">{ta('subtitle')}</p>
          <h1 className="font-display text-2xl font-extrabold text-foam">{ta('title')}</h1>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {['7d','30d','90d','year','all'].map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${range === r ? 'gradient-tide text-white' : 'glass-card text-foam/60'}`}>
              {r === 'year' ? ta('filter_year') : r === 'all' ? ta('filter_all') : r}
            </button>
          ))}
          <select value={filterSpecies} onChange={e => setFilterSpecies(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-abyss-700 text-foam/70 border border-tide-300/15 flex-shrink-0">
            <option value="all">{ta('filter_species_all')}</option>
            {allSpecies.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <KPICard icon={Fish} label={ta('kpi_catches_total')} value={totalCatches} sub={`${ta('timerange_label')}: ${range}`} />
          <KPICard icon={TrendingUp} label={ta('kpi_avg_weight')} value={avgWeight !== '—' ? `${avgWeight} kg` : '—'} sub={ta('kpi_weight_desc')} />
          <KPICard icon={Trophy} label={ta('kpi_top_species')} value={topSpecies} sub={speciesCounts[topSpecies] ? `${speciesCounts[topSpecies]}x` : ''} sun />
          <KPICard icon={Anchor} label={ta('kpi_hookpoints')} value={totalHP} sub={ta('kpi_hookpoints_desc')} sun />
        </div>

        {/* Bar Chart */}
        <div className="glass-card rounded-2xl p-4">
          <p className="font-display font-bold text-foam text-sm mb-4">{ta('chart_catches_per_month')}</p>
          {filtered.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-foam/30 text-sm">{ta('no_data')}</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={monthData} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fill: 'rgba(234,248,250,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#041C2B', border: '1px solid rgba(127,220,229,0.2)', borderRadius: 12, color: '#EAF8FA' }} />
                <Bar dataKey="count" name={catchesName} fill="#1FA7B8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut + Line side by side on larger screens, stacked on mobile */}
        <div className="grid grid-cols-1 gap-4">
          <div className="glass-card rounded-2xl p-4">
            <p className="font-display font-bold text-foam text-sm mb-4">{ta('chart_by_species')}</p>
            {donutData.length === 0 ? (
              <div className="h-36 flex items-center justify-center text-foam/30 text-sm">{ta('no_data')}</div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                      {donutData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  {donutData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-foam/60 text-xs truncate">{d.name}</span>
                      <span className="text-foam font-bold text-xs ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-4">
            <p className="font-display font-bold text-foam text-sm mb-4">{ta('chart_by_daytime')}</p>
            {filtered.length === 0 ? (
              <div className="h-36 flex items-center justify-center text-foam/30 text-sm">{ta('no_data')}</div>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={hourData}>
                  <XAxis dataKey="name" tick={{ fill: 'rgba(234,248,250,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: '#041C2B', border: '1px solid rgba(127,220,229,0.2)', borderRadius: 12, color: '#EAF8FA' }} />
                  <Line type="monotone" dataKey="count" name={catchesName} stroke="#F5C34B" strokeWidth={2.5} dot={{ fill: '#F5C34B', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="h-4" />
      </div>
    </PageTransition>
  );
}
