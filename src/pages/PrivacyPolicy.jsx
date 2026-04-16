import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';

const SECTION_IDS = [
  'responsible','data','purpose','legal_basis','third_parties','retention',
  'rights','cookies','analytics','processors','transfer','children','changes','dpo',
];

function Section({ s }) {
  const [open, setOpen] = useState(false);
  return (
    <div id={s.id} className="glass-card rounded-2xl overflow-hidden scroll-mt-4">
      <button onClick={() => setOpen(v => !v)} className="w-full px-5 py-4 flex items-center justify-between text-left">
        <h2 className="font-display font-bold text-foam text-sm">{s.title}</h2>
        {open ? <ChevronUp className="w-4 h-4 text-tide-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-foam/30 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-tide-400/10">
          <p className="text-foam/60 text-sm leading-relaxed whitespace-pre-line pt-3">{s.content}</p>
        </div>
      )}
    </div>
  );
}

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  const sections = SECTION_IDS.map((id, i) => ({
    id,
    title: t(`privacy.s${i + 1}_title`),
    content: t(`privacy.s${i + 1}_content`),
  }));

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-12 max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('legal.privacy')}</h1>
          <p className="text-foam/40 text-xs mt-1">{t('privacy.last_updated')}</p>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <p className="text-foam/50 text-xs mb-2 font-semibold">{t('privacy.toc')}</p>
          <div className="grid grid-cols-2 gap-1">
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} className="text-tide-400 text-xs truncate hover:underline">{s.title}</a>
            ))}
          </div>
        </div>

        {sections.map(s => <Section key={s.id} s={s} />)}

        <p className="text-center text-foam/20 text-xs">© 2026 NOMDAD LLC · StrikeAhead</p>
      </div>
    </PageTransition>
  );
}
