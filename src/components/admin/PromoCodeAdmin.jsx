import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TYPE_COLORS = {
  friend: 'bg-tide-500/20 text-tide-300',
  ambassador: 'bg-lime2/20 text-lime2',
  beta: 'bg-sun-400/20 text-sun-300',
  press: 'bg-coral-400/20 text-coral-400',
};
const PLAN_LABELS = { angler: 'Angler', pro: 'Pro', legend: 'Legend' };

function randomCode(type) {
  const prefix = type.toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${suffix}`;
}

function CodeRow({ promo, adminEmail }) {
  const [expanded, setExpanded] = useState(false);
  const [redemptions, setRedemptions] = useState([]);
  const [loadingRed, setLoadingRed] = useState(false);
  const [copied, setCopied] = useState(false);

  const isExpired = promo.expires_date && new Date(promo.expires_date) < new Date();
  const isUsedUp = promo.times_used >= promo.max_uses;
  const statusLabel = !promo.active ? 'inaktiv' : isExpired ? 'abgelaufen' : isUsedUp ? 'verbraucht' : 'aktiv';
  const statusColor = statusLabel === 'aktiv' ? 'text-lime2' : 'text-foam/40';

  const loadRedemptions = async () => {
    if (redemptions.length > 0) { setExpanded(e => !e); return; }
    setLoadingRed(true);
    const res = await base44.entities.PromoRedemption.filter({ code: promo.code });
    setRedemptions(res);
    setLoadingRed(false);
    setExpanded(true);
  };

  const copy = () => {
    navigator.clipboard.writeText(promo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-foam text-sm">{promo.code}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${TYPE_COLORS[promo.type] || 'bg-abyss-700 text-foam/40'}`}>{promo.type}</span>
            <span className={`text-[11px] font-semibold ${statusColor}`}>{statusLabel}</span>
          </div>
          <p className="text-foam/40 text-xs mt-0.5">
            {PLAN_LABELS[promo.grants_plan]} · {promo.duration_days ? `${promo.duration_days} Tage` : 'dauerhaft'} · {promo.times_used}/{promo.max_uses} eingelöst
            {promo.note ? ` · ${promo.note}` : ''}
          </p>
        </div>
        <button onClick={copy} className="w-7 h-7 rounded-lg bg-abyss-700 flex items-center justify-center flex-shrink-0">
          {copied ? <Check className="w-3.5 h-3.5 text-lime2" /> : <Copy className="w-3.5 h-3.5 text-foam/40" />}
        </button>
        <button onClick={loadRedemptions} className="w-7 h-7 rounded-lg bg-abyss-700 flex items-center justify-center flex-shrink-0">
          {loadingRed ? <RefreshCw className="w-3.5 h-3.5 text-foam/40 animate-spin" /> : expanded ? <ChevronUp className="w-3.5 h-3.5 text-foam/40" /> : <ChevronDown className="w-3.5 h-3.5 text-foam/40" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-white/5 px-4 py-3 space-y-2">
          {redemptions.length === 0
            ? <p className="text-foam/30 text-xs">Noch keine Einlösungen.</p>
            : redemptions.map(r => (
              <div key={r.id} className="flex justify-between text-xs">
                <span className="text-foam/60">{r.user_email}</span>
                <span className="text-foam/30">{r.redeemed_date ? new Date(r.redeemed_date).toLocaleDateString('de-DE') : '–'}</span>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

export default function PromoCodeAdmin({ adminEmail }) {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '', type: 'friend', grants_plan: 'pro',
    duration_days: '', max_uses: 1, note: '', expires_date: '',
  });

  useEffect(() => {
    base44.entities.PromoCode.list('-created_date', 100)
      .then(setCodes).finally(() => setLoading(false));
  }, []);

  const generateCode = () => setForm(f => ({ ...f, code: randomCode(f.type) }));

  const save = async () => {
    if (!form.code.trim()) return;
    setSaving(true);
    const record = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      grants_plan: form.grants_plan,
      duration_days: form.duration_days ? Number(form.duration_days) : null,
      max_uses: Number(form.max_uses) || 1,
      times_used: 0,
      active: true,
      created_by: adminEmail,
      note: form.note || '',
      expires_date: form.expires_date || null,
    };
    const created = await base44.entities.PromoCode.create(record);
    setCodes(prev => [created, ...prev]);
    setShowForm(false);
    setForm({ code: '', type: 'friend', grants_plan: 'pro', duration_days: '', max_uses: 1, note: '', expires_date: '' });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-foam font-bold text-sm">Promo Codes ({codes.length})</h3>
        <button onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl gradient-tide text-white text-xs font-bold">
          <Plus className="w-3.5 h-3.5" /> Neuer Code
        </button>
      </div>

      {showForm && (
        <div className="glass-card rounded-2xl p-4 space-y-3">
          <div className="flex gap-2">
            <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="Code" className="flex-1 bg-abyss-800 border border-tide-400/20 rounded-xl px-3 py-2 text-foam text-sm font-mono outline-none" />
            <button onClick={generateCode} title="Generieren"
              className="w-9 h-9 rounded-xl bg-abyss-700 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-4 h-4 text-tide-400" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-foam/40 text-[11px] mb-1">Typ</p>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-abyss-800 border border-tide-400/20 rounded-xl px-3 py-2 text-foam text-sm outline-none">
                {['friend', 'ambassador', 'beta', 'press'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <p className="text-foam/40 text-[11px] mb-1">Plan</p>
              <select value={form.grants_plan} onChange={e => setForm(f => ({ ...f, grants_plan: e.target.value }))}
                className="w-full bg-abyss-800 border border-tide-400/20 rounded-xl px-3 py-2 text-foam text-sm outline-none">
                {['angler', 'pro', 'legend'].map(p => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
              </select>
            </div>
            <div>
              <p className="text-foam/40 text-[11px] mb-1">Dauer (Tage, leer = ewig)</p>
              <input type="number" value={form.duration_days} onChange={e => setForm(f => ({ ...f, duration_days: e.target.value }))}
                placeholder="z.B. 30" className="w-full bg-abyss-800 border border-tide-400/20 rounded-xl px-3 py-2 text-foam text-sm outline-none" />
            </div>
            <div>
              <p className="text-foam/40 text-[11px] mb-1">Max. Nutzungen</p>
              <input type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                className="w-full bg-abyss-800 border border-tide-400/20 rounded-xl px-3 py-2 text-foam text-sm outline-none" />
            </div>
          </div>

          <div>
            <p className="text-foam/40 text-[11px] mb-1">Ablaufdatum (optional)</p>
            <input type="date" value={form.expires_date?.slice(0, 10) || ''} onChange={e => setForm(f => ({ ...f, expires_date: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
              className="w-full bg-abyss-800 border border-tide-400/20 rounded-xl px-3 py-2 text-foam text-sm outline-none" />
          </div>

          <div>
            <p className="text-foam/40 text-[11px] mb-1">Interne Notiz</p>
            <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="z.B. Für YouTuber Max Fischer" className="w-full bg-abyss-800 border border-tide-400/20 rounded-xl px-3 py-2 text-foam text-sm outline-none" />
          </div>

          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.code.trim()}
              className="flex-1 py-2.5 rounded-xl gradient-tide text-white text-sm font-bold disabled:opacity-50">
              {saving ? 'Speichern…' : 'Code erstellen'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl glass-card text-foam/50 text-sm">
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {loading
        ? <div className="text-center py-6"><div className="w-6 h-6 border-2 border-tide-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        : codes.length === 0
          ? <p className="text-foam/30 text-sm text-center py-4">Noch keine Promo Codes.</p>
          : codes.map(c => <CodeRow key={c.id} promo={c} adminEmail={adminEmail} />)
      }
    </div>
  );
}