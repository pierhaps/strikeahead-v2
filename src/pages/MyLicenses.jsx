import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Shield, AlertTriangle, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/ui/PageTransition';
import { base44 } from '@/api/base44Client';

const tideEase = [0.2, 0.8, 0.2, 1];

const getStatusConfig = (t) => ({
  valid: { label: t('mylicenses.status.valid'), bg: 'rgba(31,167,184,0.15)', color: '#4DC3D1', border: 'rgba(31,167,184,0.3)' },
  expiring_soon: { label: t('mylicenses.status.expiring_soon'), bg: 'rgba(245,195,75,0.12)', color: '#F5C34B', border: 'rgba(245,195,75,0.3)' },
  expired: { label: t('mylicenses.status.expired'), bg: 'rgba(255,107,91,0.12)', color: '#FF6B5B', border: 'rgba(255,107,91,0.3)' },
  pending_verification: { label: t('mylicenses.status.pending_verification'), bg: 'rgba(127,220,229,0.08)', color: '#7FDCE5', border: 'rgba(127,220,229,0.2)' },
});

const COUNTRY_FLAGS = {
  'Deutschland': '🇩🇪', 'Germany': '🇩🇪', 'Österreich': '🇦🇹', 'Austria': '🇦🇹',
  'Schweiz': '🇨🇭', 'Switzerland': '🇨🇭', 'Niederlande': '🇳🇱', 'Netherlands': '🇳🇱',
  'Frankreich': '🇫🇷', 'France': '🇫🇷', 'Spanien': '🇪🇸', 'Spain': '🇪🇸',
  'Italien': '🇮🇹', 'Italy': '🇮🇹', 'Kroatien': '🇭🇷', 'Croatia': '🇭🇷',
  'Dänemark': '🇩🇰', 'Denmark': '🇩🇰', 'Norwegen': '🇳🇴', 'Norway': '🇳🇴',
  'Schweden': '🇸🇪', 'Sweden': '🇸🇪', 'Polen': '🇵🇱', 'Poland': '🇵🇱',
  'Portugal': '🇵🇹', 'Griechenland': '🇬🇷', 'Greece': '🇬🇷',
};

function UploadModal({ onClose, onSave }) {
  const [phase, setPhase] = useState('upload'); // upload | analyzing | form
  const [form, setForm] = useState({ license_name: '', country: '', valid_from: '', valid_until: '', license_type: 'yearly' });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setPhase('analyzing');
    const uploaded = await base44.integrations.Core.UploadFile({ file });
    const extracted = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract fishing license information from this document image. Return JSON with: license_name, country, license_number, valid_from (YYYY-MM-DD), valid_until (YYYY-MM-DD), license_type (daily/weekly/monthly/yearly/multi_year/lifetime/tourist).`,
      file_urls: [uploaded.file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          license_name: { type: 'string' },
          country: { type: 'string' },
          license_number: { type: 'string' },
          valid_from: { type: 'string' },
          valid_until: { type: 'string' },
          license_type: { type: 'string' },
        }
      }
    });
    setForm(f => ({ ...f, ...extracted, document_url: uploaded.file_url }));
    setPhase('form');
  };

  const handleSave = async () => {
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    let status = 'valid';
    if (form.valid_until) {
      const d = new Date(form.valid_until);
      const diff = (d - new Date()) / 86400000;
      if (diff < 0) status = 'expired';
      else if (diff < 30) status = 'expiring_soon';
    }
    await base44.entities.UserLicense.create({ ...form, validity_status: status, upload_type: 'photo' });
    onSave();
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(2,21,33,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="glass-strong rounded-t-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-foam/20 rounded-full mx-auto" />
        <h3 className="font-display font-bold text-foam text-lg">Lizenz hinzufügen</h3>

        {phase === 'upload' && (
          <div className="space-y-3">
            <div className="glass-card rounded-2xl p-6 text-center" style={{ border: '2px dashed rgba(127,220,229,0.2)' }}>
              <Shield className="w-10 h-10 text-tide-400 mx-auto mb-3" />
              <p className="font-bold text-foam mb-1">Lizenz fotografieren oder hochladen</p>
              <p className="text-foam/40 text-sm mb-4">KI extrahiert alle Daten automatisch</p>
              <button onClick={() => fileRef.current?.click()}
                className="w-full py-3.5 rounded-2xl gradient-tide text-white font-bold glow-tide">
                Foto / PDF hochladen
              </button>
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
                onChange={e => handleFile(e.target.files?.[0])} />
            </div>
            <button onClick={() => setPhase('form')}
              className="w-full py-3 rounded-2xl glass-card text-foam/60 text-sm">
              Manuell eingeben
            </button>
          </div>
        )}

        {phase === 'analyzing' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-10 h-10 text-tide-400 animate-spin" />
            <p className="font-bold text-foam">KI analysiert Lizenz...</p>
            <p className="text-foam/40 text-sm">Daten werden extrahiert</p>
          </div>
        )}

        {phase === 'form' && (
          <div className="space-y-3">
            {[
              { key: 'license_name', label: 'Bezeichnung', type: 'text', placeholder: 'z.B. Jahresangellizenz Bayern' },
              { key: 'country', label: 'Land', type: 'text', placeholder: 'Deutschland' },
              { key: 'valid_from', label: 'Gültig ab', type: 'date' },
              { key: 'valid_until', label: 'Gültig bis', type: 'date' },
            ].map(f => (
              <div key={f.key} className="glass-card rounded-2xl px-4 py-3 flex items-center justify-between">
                <span className="text-foam/50 text-sm">{f.label}</span>
                <input type={f.type} value={form[f.key] || ''} placeholder={f.placeholder}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="bg-transparent text-foam text-sm text-right outline-none w-40 placeholder-foam/20" />
              </div>
            ))}
            <div className="flex gap-3 mt-2">
              <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl glass-card text-foam/60 font-semibold">Abbrechen</button>
              <button onClick={handleSave} disabled={saving || !form.license_name}
                className={`flex-1 py-3.5 rounded-2xl font-display font-bold ${form.license_name ? 'gradient-tide text-white glow-tide' : 'bg-abyss-700 text-foam/30'}`}>
                {saving ? '…' : 'Speichern'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function MyLicenses() {
  const { t } = useTranslation();
  const STATUS_CONFIG = React.useMemo(() => getStatusConfig(t), [t]);
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = () => {
    base44.entities.UserLicense.list('-valid_until', 100).then(data => {
      setLicenses(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <PageTransition><div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-tide-400 border-t-transparent rounded-full animate-spin" />
    </div></PageTransition>
  );

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-24 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foam/50 text-sm">{t('mylicenses.subtitle')}</p>
            <h1 className="font-display text-2xl font-extrabold text-foam">{t('mylicenses.title')}</h1>
          </div>
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold glass-card text-tide-400">{licenses.length}</span>
        </div>

        {licenses.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center mt-8">
            <Shield className="w-12 h-12 text-tide-400/40 mx-auto mb-4" />
            <p className="font-display font-bold text-foam text-lg">{t('mylicenses.empty_title')}</p>
            <p className="text-foam/40 text-sm mt-2 mb-6">{t('mylicenses.empty_desc')}</p>
            <button onClick={() => setShowAdd(true)}
              className="inline-block px-6 py-3 rounded-2xl gradient-tide text-white font-bold text-sm glow-tide">
              {t('mylicenses.add_button')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {licenses.map((lic, i) => {
              const st = STATUS_CONFIG[lic.validity_status] || STATUS_CONFIG.pending_verification;
              const flag = COUNTRY_FLAGS[lic.country] || '🌍';
              return (
                <motion.button key={lic.id} onClick={() => setSelected(lic)}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full glass-card rounded-2xl p-4 text-left flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-abyss-700 flex items-center justify-center text-2xl flex-shrink-0">
                    {flag}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foam font-semibold text-sm truncate">{lic.license_name}</p>
                    <p className="text-foam/40 text-xs">{lic.country}{lic.region ? ` · ${lic.region}` : ''}</p>
                    {lic.valid_until && (
                      <p className="text-foam/40 text-xs mt-0.5">{t('mylicenses.valid_until_prefix')} {lic.valid_until}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap"
                      style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                      {st.label}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button whileTap={{ scale: 0.93 }} onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full gradient-tide glow-tide flex items-center justify-center z-40 shadow-xl">
        <Plus className="w-7 h-7 text-white" />
      </motion.button>

      {/* Detail Sheet */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-end"
            style={{ background: 'rgba(2,21,33,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelected(null)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              className="glass-strong rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-foam/20 rounded-full mx-auto mb-4" />
              <div className="flex items-start gap-3 mb-4">
                <div className="text-3xl">{COUNTRY_FLAGS[selected.country] || '🌍'}</div>
                <div className="flex-1">
                  <h2 className="font-display font-bold text-foam text-lg">{selected.license_name}</h2>
                  <p className="text-foam/40 text-sm">{selected.country}{selected.region ? ` · ${selected.region}` : ''}</p>
                </div>
              </div>
              {selected.document_thumbnail_url && (
                <div className="h-48 rounded-2xl overflow-hidden mb-4">
                  <img src={selected.document_thumbnail_url} alt="Lizenz" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="space-y-2 mb-4">
                {[
                  [t('mylicenses.detail.license_number'), selected.license_number],
                  [t('mylicenses.detail.valid_from'), selected.valid_from],
                  [t('mylicenses.detail.valid_until'), selected.valid_until],
                  [t('mylicenses.detail.type'), selected.license_type],
                  [t('mylicenses.detail.price'), selected.price_paid ? `${selected.price_paid} €` : null],
                ].filter(([_, v]) => v).map(([k, v]) => (
                  <div key={k} className="glass-card rounded-xl px-4 py-2.5 flex justify-between">
                    <span className="text-foam/40 text-sm">{k}</span>
                    <span className="text-foam font-semibold text-sm">{v}</span>
                  </div>
                ))}
              </div>
              {selected.special_conditions && (
                <div className="glass-card rounded-xl p-3 mb-4">
                  <p className="text-foam/40 text-xs mb-1">{t('mylicenses.detail.special_conditions')}</p>
                  <p className="text-foam/70 text-sm">{selected.special_conditions}</p>
                </div>
              )}
              <button onClick={() => setSelected(null)} className="w-full py-3.5 rounded-2xl glass-card text-foam/70 font-semibold">{t('mylicenses.detail.close')}</button>
            </motion.div>
          </motion.div>
        )}
        {showAdd && <UploadModal onClose={() => setShowAdd(false)} onSave={load} />}
      </AnimatePresence>
    </PageTransition>
  );
}