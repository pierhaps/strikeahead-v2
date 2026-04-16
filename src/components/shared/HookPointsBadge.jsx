import React from 'react';
import { Anchor } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const localeTag = (code) => {
  const map = { de: 'de-DE', en: 'en-US', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', hr: 'hr-HR', pt: 'pt-PT', nl: 'nl-NL', tr: 'tr-TR', el: 'el-GR', sq: 'sq-AL' };
  return map[code] || 'de-DE';
};

/**
 * Reusable HookPoints display always in sun-gradient.
 * <HookPointsBadge value={520} size="sm|md|lg" />
 */
export default function HookPointsBadge({ value, size = 'md', showIcon = true }) {
  const { i18n } = useTranslation();
  const sizes = {
    sm: { text: 'text-sm', icon: 'w-3 h-3', px: 'px-2 py-1', gap: 'gap-1' },
    md: { text: 'text-base', icon: 'w-3.5 h-3.5', px: 'px-2.5 py-1.5', gap: 'gap-1.5' },
    lg: { text: 'text-xl font-extrabold', icon: 'w-5 h-5', px: 'px-3 py-2', gap: 'gap-2' },
  };
  const s = sizes[size];

  return (
    <div
      className={`inline-flex items-center ${s.gap} ${s.px} rounded-xl`}
      style={{ background: 'rgba(245,195,75,0.12)', border: '1px solid rgba(245,195,75,0.25)' }}
    >
      {showIcon && <Anchor className={`${s.icon} text-sun-400`} />}
      <span className={`text-sun-gradient font-bold font-display ${s.text}`}>
        {typeof value === 'number' ? value.toLocaleString(localeTag(i18n.language)) : value}
      </span>
      <span className="text-sun-400/50 text-xs">HP</span>
    </div>
  );
}